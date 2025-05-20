import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "DEFAULT_OPEN_API_KEY" 
});

// General chat completion function
export async function generateChatResponse(messages: Array<{role: string, content: string}>): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    return response.choices[0].message.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Error generating chat response:", error);
    throw new Error("Failed to generate AI response");
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
      response_format: { type: "json_object" }
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
    throw new Error("Failed to summarize email");
  }
}
