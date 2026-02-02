import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, Category } from "../types.ts";

// Always use named parameter and direct process.env.API_KEY access
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Fast AI Categorization using Flash model.
 * Ideal for real-time input processing.
 */
export const categorizeExpenseAI = async (text: string, categories: Category[]) => {
  if (!process.env.API_KEY) return null;

  const categoryNames = categories.map(c => `${c.name} (${c.nameBn})`).join(", ");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `You are a professional financial assistant for ALOCK LTD. 
    Analyze the following entry (English or Bengali) and extract transaction details.
    Categories available: [${categoryNames}]. 
    Entry: "${text}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          amount: { type: Type.NUMBER },
          category: { type: Type.STRING },
          type: { type: Type.STRING, description: "INCOME or EXPENSE" },
          note: { type: Type.STRING },
          isRecurring: { type: Type.BOOLEAN, description: "If the text implies this happens every month/week" }
        },
        required: ["amount", "category", "type"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("AI Categorization Error", e);
    return null;
  }
};

/**
 * Advanced Financial Insights using Pro model.
 * Generates professional advice based on spending patterns.
 */
export const getAdvancedFinancialAdvice = async (transactions: Transaction[], language: 'EN' | 'BN') => {
  if (!process.env.API_KEY) return "AI service unavailable.";
  if (transactions.length === 0) return language === 'BN' ? "বিশ্লেষণ করার জন্য যথেষ্ট তথ্য নেই।" : "Not enough data for professional analysis.";

  const dataSummary = transactions.slice(0, 50).map(t => `${t.date}: ${t.type} ${t.amount} BDT for ${t.category} (${t.note})`).join("\n");
  
  const prompt = language === 'BN' 
    ? `আপনি ALOCK LTD-এর একজন পেশাদার আর্থিক বিশ্লেষক। নিচে একজন ব্যবহারকারীর সাম্প্রতিক ৫০টি লেনদেনের তালিকা দেওয়া হলো:
    
    ${dataSummary}
    
    এই তথ্যের ভিত্তিতে একটি সংক্ষিপ্ত প্রফেশনাল রিপোর্ট তৈরি করুন। রিপোর্টে নিচের বিষয়গুলো থাকবে:
    ১. ব্যয়ের ধরণ বিশ্লেষণ।
    ২. টাকা বাঁচানোর জন্য ৩টি কার্যকরী পরামর্শ।
    ৩. সামনের মাসের জন্য একটি বাজেট পরিকল্পনা।
    উত্তরটি সরাসরি বাংলায় দিন।`
    : `You are a professional financial advisor for ALOCK LTD. Analyze these recent 50 transactions:
    
    ${dataSummary}
    
    Provide a professional financial report including:
    1. Spending pattern analysis.
    2. 3 highly actionable savings tips.
    3. A brief budget forecast for the next month.
    Respond in a professional tone.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt
  });

  return response.text;
};

/**
 * Detects unusual spending or anomalies in transactions.
 */
export const detectSpendingAnomalies = async (transactions: Transaction[], language: 'EN' | 'BN') => {
  if (!process.env.API_KEY || transactions.length < 5) return null;

  const dataSummary = transactions.map(t => `${t.type} ${t.amount} BDT for ${t.category}`).join(", ");
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Review these transactions for any unusual spending patterns (e.g. extremely high amount compared to others). 
    If found, explain why it looks suspicious. Data: [${dataSummary}]`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          hasAnomaly: { type: Type.BOOLEAN },
          // Fixed: Changed to template literal for proper string interpolation of language
          explanation: { type: Type.STRING, description: `Professional explanation in ${language === 'BN' ? 'Bengali' : 'English'}` }
        },
        // Added required field to improve AI output reliability
        required: ["hasAnomaly", "explanation"]
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return null;
  }
};