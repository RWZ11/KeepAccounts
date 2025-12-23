import { GoogleGenAI, Type } from "@google/genai";

// API Key management
const getApiKey = (): string => {
  // First check localStorage (user configured)
  const storedKey = localStorage.getItem('zenledger_gemini_api_key');
  if (storedKey) {
    return storedKey;
  }
  // Fall back to environment variable
  return process.env.API_KEY || '';
};

const setApiKey = (key: string): void => {
  if (key.trim()) {
    localStorage.setItem('zenledger_gemini_api_key', key.trim());
  } else {
    localStorage.removeItem('zenledger_gemini_api_key');
  }
};

// Initialize safely. We'll create AI instance when needed.
let ai: GoogleGenAI | null = null;

const getAIInstance = (): GoogleGenAI | null => {
  const key = getApiKey();
  if (key && (!ai || ai.apiKey !== key)) {
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
};

export const GeminiService = {
  /**
   * API Key management
   */
  getApiKey: getApiKey,
  setApiKey: setApiKey,

  /**
   * Parses a natural language input string into a structured transaction object.
   */
  parseTransaction: async (input: string) => {
    const aiInstance = getAIInstance();
    if (!aiInstance) return null;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Extract transaction details from this text: "${input}". 
        Return a JSON object with:
        - amount: number
        - type: "expense" or "income"
        - categoryName: string (guess a standard category like Dining, Transport, Shopping, etc.)
        - note: string
        - date: string (ISO 8601 format, default to today if not specified)
        
        Example: "Bought lunch for 15" -> {"amount": 15, "type": "expense", "categoryName": "Dining", "note": "Lunch", "date": "2023-10-27T10:00:00.000Z"}
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              amount: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ["expense", "income"] },
              categoryName: { type: Type.STRING },
              note: { type: Type.STRING },
              date: { type: Type.STRING },
            },
            required: ["amount", "type", "categoryName"]
          }
        }
      });

      if (response.text) {
        return JSON.parse(response.text);
      }
      return null;
    } catch (error) {
      console.error("Gemini Parse Error:", error);
      return null;
    }
  },

  /**
   * Provides financial advice based on monthly summary.
   */
  getFinancialAdvice: async (income: number, expense: number, topCategories: string[], language: string = 'zh-CN') => {
    const aiInstance = getAIInstance();
    if (!aiInstance) return "请配置您的 API Key 以获取智能财务建议。";

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `我本月支出了 ${expense} 元，收入了 ${income} 元。我的主要支出类别是 ${topCategories.join(', ')}。
        请给我一条简短的（2句话以内）财务建议。语气要鼓励且实用。
        请务必使用简体中文回答。`,
      });
      return response.text;
    } catch (error) {
      return "暂时无法生成建议。";
    }
  }
};
