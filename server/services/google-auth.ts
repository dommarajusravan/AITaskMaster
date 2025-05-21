import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { IStorage } from '../storage';
import { User } from '@shared/schema';
import express from 'express';

declare global {
  namespace Express {
    interface User {
      id: number;
      googleId: string;
      name: string;
      email: string;
      picture?: string;
    }
  }
}

export function setupGoogleAuth(app: express.Express, storage: IStorage) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        callbackURL: `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co/api/auth/google/callback`,
        scope: ['profile', 'email'],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          
          // Check if user exists
          let user = await storage.getUserByGoogleId(googleId);
          
          if (!user) {
            // Create new user if not exists
            const email = profile.emails?.[0]?.value || '';
            const name = profile.displayName || '';
            const picture = profile.photos?.[0]?.value || '';
            
            user = await storage.createUser({
              googleId,
              name,
              email,
              picture,
            });
          } else {
            // Update login timestamp
            await storage.updateUserLastLogin(user.id);
          }
          
          return done(null, user);
        } catch (error) {
          return done(error as Error);
        }
      }
    )
  );

  // Serialize user to session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user || undefined);
    } catch (error) {
      done(error);
    }
  });

  // Initialize passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
}
