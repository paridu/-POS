import { GoogleGenAI } from "@google/genai";
import { db } from './mockDatabase';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key missing");
    throw new Error("API Key is missing. Please check your environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeBusinessData = async (userPrompt: string) => {
  try {
    const ai = getClient();
    const data = db.getDataForAI();
    
    // Prepare a context-rich prompt
    const context = `
      You are an expert business analyst for a retail shop.
      Here is the current database state in JSON format:
      
      Products: ${JSON.stringify(data.products.map(p => ({name: p.name, stock: p.stock, price: p.price, cost: p.cost})))}
      Sales Summary: ${JSON.stringify(data.sales.slice(-20))} (Last 20 transactions)
      
      Your goal is to answer the user's question based on this data.
      Provide insights on sales trends, low stock warnings, or profitability.
      Answer in Thai language.
      Keep the answer concise and helpful.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: context }] },
        { role: 'user', parts: [{ text: userPrompt }] }
      ]
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "ขออภัย ระบบ AI ไม่สามารถประมวลผลได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง";
  }
};
