import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  const geminiKey = process.env.GEMINI_API_KEY;
  
  if (!geminiKey) {
    return res.status(400).json({ 
      success: false, 
      error: "GEMINI_API_KEY is missing from environment variables." 
    });
  }

  try {
    const genAI = new GoogleGenAI({ apiKey: geminiKey });
    
    // Try a very simple, low-token request to verify the key
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Please reply with exactly the word: OK",
    });

    res.status(200).json({ 
      success: true, 
      message: "Key is valid! Gemini responded successfully.",
      reply: response.text 
    });
    
  } catch (error: any) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      fullError: JSON.stringify(error)
    });
  }
}
