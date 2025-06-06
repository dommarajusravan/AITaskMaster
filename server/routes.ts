import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { setupGoogleAuth } from "./services/google-auth";
import { isAuthenticated } from "./middleware/auth";
import { generateChatResponse, summarizeEmail } from "./services/openai";
import { insertConversationSchema, insertMessageSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "ai-assistant-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 1 day
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Add simple authentication middleware
  // Initialize passport and session
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup Google OAuth
  setupGoogleAuth(app, storage);

  // Google OAuth routes
  app.get('/api/auth/google', passport.authenticate('google'));

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
      res.redirect('/');
    }
  );

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user;
      res.json({
        isAuthenticated: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.picture,
        },
      });
    } else {
      res.json({
        isAuthenticated: false,
        user: null,
      });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already registered with this email" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        googleId: '',
      });
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login after registration failed" });
        }
        res.json({ success: true, user });
      });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        return res.status(401).json({ message: "User not found. Please sign up first." });
      }
      if (!user.password) {
        return res.status(401).json({ message: "Invalid login method" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.user = user;
      res.json({ success: true });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Session destruction failed" });
        }
        res.json({ success: true });
      });
    });
  });

  // Conversation routes
  app.get("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const conversations = await storage.getConversations(req.user!.id);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse({
        userId: req.user!.id,
        title: req.body.title || "New Conversation",
      });

      const conversation = await storage.createConversation(validatedData);
      res.status(201).json(conversation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (conversation.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view this conversation" });
      }

      const messages = await storage.getMessages(conversationId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
      }

      const conversation = await storage.getConversation(conversationId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (conversation.userId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to update this conversation" });
      }

      // Validate and save user message
      const userMessageData = insertMessageSchema.parse({
        conversationId,
        role: "user",
        content: req.body.content,
      });

      const userMessage = await storage.createMessage(userMessageData);

      // Get conversation history to provide context
      const messages = await storage.getMessages(conversationId);

      // Format messages for OpenAI API
      const formattedMessages = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      }));

      // Generate AI response
      let aiResponse;
      try {
        aiResponse = await generateChatResponse(formattedMessages);
      } catch (error) {
        console.error("Failed to generate AI response:", error);
        aiResponse = "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
      }

      // Save AI response
      const aiMessageData = insertMessageSchema.parse({
        conversationId,
        role: "assistant",
        content: aiResponse,
      });

      const aiMessage = await storage.createMessage(aiMessageData);

      res.json({
        userMessage,
        aiMessage,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Email summarization endpoint
  app.post("/api/email/summarize", isAuthenticated, async (req, res) => {
    try {
      if (!req.body.emailContent) {
        return res.status(400).json({ message: "Email content is required" });
      }

      const summary = await summarizeEmail(req.body.emailContent);
      res.json(summary);
    } catch (error) {
      console.error("Email summarization error:", error);
      res.status(500).json({ message: "Failed to summarize email" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}