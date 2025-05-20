import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "DEFAULT_OPEN_API_KEY" 
});

// General chat completion function
export async function generateChatResponse(messages: Array<{role: string, content: string}>): Promise<string> {
  try {
    // Convert the messages to the correct OpenAI format
    const formattedMessages = messages.map(msg => {
      // Ensure role is one of the valid types
      const role = (msg.role === 'user' || msg.role === 'assistant' || msg.role === 'system') 
        ? msg.role 
        : 'user';
      
      return {
        role,
        content: msg.content
      } as ChatCompletionMessageParam;
    });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: formattedMessages,
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    
    // Check if it's a rate limit error
    if (error instanceof Error && error.message.includes('429')) {
      return "I'm sorry, the AI service is currently experiencing high demand. Your message has been saved, and I'll respond when available.";
    } else if (error instanceof Error && error.message.includes('quota')) {
      return "I apologize, but the AI service quota has been exceeded. Your message has been saved. Please try again later.";
    }
    
    // For other errors, return a generic message
    return "I'm having trouble connecting to the AI service right now. Your message has been saved.";
  }
}

// Email summary function with structured output
export async function summarizeEmail(emailContent: string): Promise<{
  subject: string;
  keyInfo: string;
  actionItems: string[];
  deadline?: string;
  sender?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an email summarization assistant. Extract the key information from the provided email and return it in a structured JSON format."
        },
        {
          role: "user",
          content: `Summarize this email: ${emailContent}`
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      subject: result.subject || "Unknown Subject",
      keyInfo: result.keyInfo || result.key_info || "No key information found",
      actionItems: result.actionItems || result.action_items || [],
      deadline: result.deadline,
      sender: result.sender
    };
  } catch (error) {
    console.error("Error summarizing email:", error);
    
    // Provide a fallback result when the API is unavailable
    return {
      subject: "Summarization Unavailable",
      keyInfo: "Email summarization is currently unavailable due to API limitations. Please try again later.",
      actionItems: ["Try again later when the service is available"],
      deadline: undefined,
      sender: undefined
    };
  }
}
