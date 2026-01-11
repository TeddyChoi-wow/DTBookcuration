
import { GoogleGenAI } from "@google/genai";
import { Book } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAIRecommendations = async (query: string, books: Book[]): Promise<string[]> => {
  if (!query.trim()) return books.map(b => b.id);

  try {
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
        2. Do not limit yourself to exact keyword matches. For example, if the query is "공감 (Empathy)", look for books discussing user understanding, observation, or interviewing.
        3. Rank them by relevance.
        
        [Output Format]
        Return ONLY a comma-separated list of IDs of the relevant books. 
        Example: 1, 4, 12, 5
        If absolutely no relevance found, return "none".
      `,
      config: {
        temperature: 0.2,
      }
    });

    const result = response.text.trim();
    if (result.toLowerCase() === 'none' || !result) return [];
    
    // Clean up response string (sometimes AI adds extra text or markdown)
    const cleanedResult = result.replace(/[^0-9, ]/g, '');
    return cleanedResult.split(',').map(id => id.trim()).filter(id => id);
  } catch (error) {
    console.error("AI Recommendation Error:", error);
    // Fallback: simple string matching
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
