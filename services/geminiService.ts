

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Booking, Unit, AiConfigData } from '../types';

const MODEL_NAME = 'gemini-2.5-flash';

export const getAiResponse = async (
    prompt: string,
    bookings: Booking[],
    units: Unit[],
    config: AiConfigData
): Promise<string> => {
    if (!process.env.API_KEY) {
        console.error("API_KEY environment variable not set.");
        return "API key not configured. Please contact the administrator.";
    }
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const context = `
            You are an AI assistant for a hospitality service. 
            Your current configuration is: ${JSON.stringify(config, null, 2)}.
            Current available units: ${JSON.stringify(units.filter(u => u.status === 'Active'), null, 2)}.
            Current bookings: ${JSON.stringify(bookings, null, 2)}.
            Today's date is ${new Date().toISOString().split('T')[0]}.
            
            Based on this information, please answer the user's question. Be friendly and helpful.
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                systemInstruction: context,
            }
        });
        
        return response.text;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Sorry, I encountered an error while processing your request. Please try again later.";
    }
};
