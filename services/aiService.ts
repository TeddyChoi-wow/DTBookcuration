
import { GoogleGenAI } from "@google/genai";
import { Book } from "../types.ts";

export const getAIRecommendations = async (query: string, books: Book[]): Promise<string[]> => {
  if (!query.trim()) return books.map(b => b.id);

  try {
    // Initialize inside the function to be safe against missing environment variables at load time
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const bookDataStr = books.map(b => `ID:${b.id} | Title:${b.title} | Reason:${b.reason} | Keywords:${b.keywords.join(',')}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        [Role] You are an expert Design Thinking Book Curator.
        [Context] A user is looking for books based on their specific challenges or interest keywords.
        [Available Books]
        ${bookDataStr}
        
        [User Inquiry] "${query}"
        
        [Task] 
        1. Identify books that match the *intent* and *context* of the user inquiry.
        2. Do not limit yourself to exact keyword matches.
        3. Rank them by relevance.
        
        [Output Format]
        Return ONLY a comma-separated list of IDs of the relevant books. 
        Example: 1, 4, 12, 5
        If absolutely no relevance found, return "none".
      `,
      config: {
        temperature: 0.1, // Lower temperature for more consistent ID extraction
      }
    });

    const result = response.text?.trim();
    if (!result || result.toLowerCase() === 'none') return [];
    
    // Clean up response string to extract only IDs and commas
    const cleanedResult = result.replace(/[^0-9, ]/g, '');
    return cleanedResult.split(',').map(id => id.trim()).filter(id => id);
  } catch (error) {
    console.warn("AI Recommendation Error (Falling back to text search):", error);
    // Fallback: simple case-insensitive string matching
    const q = query.toLowerCase();
    return books
      .filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.reason.toLowerCase().includes(q) || 
        b.keywords.some(k => k.toLowerCase().includes(q))
      )
      .map(b => b.id);
  }
};
