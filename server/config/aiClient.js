import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const provider = process.env.AI_PROVIDER || 'gemini';

let openai = null;
let genAI = null;

if (provider === 'openai') {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } else {
    console.warn('AI Provider set to OpenAI but OPENAI_API_KEY is not defined.');
  }
} else {
  if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  } else {
    console.warn('AI Provider set to Gemini but GEMINI_API_KEY is not defined.');
  }
}

/**
 * Clean markdown code block wraps from a string.
 * Helpful if an AI model ignores formatting instructions and returns fences.
 */
function cleanJsonString(str) {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * Uniform completion utility.
 * @param {string} prompt The primary user prompt.
 * @param {string} systemInstruction Optional system instruction text.
 * @returns {Promise<Object>} The parsed JSON response object.
 */
export const getAIJSONCompletion = async (prompt, systemInstruction = '') => {
  try {
    let resultString = '';

    if (provider === 'openai') {
      if (!openai) {
        throw new Error('OpenAI client not initialized. Check your OPENAI_API_KEY.');
      }
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction || 'You are an AI resume analysis expert. Return JSON output only.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      });
      resultString = response.choices[0].message.content;
    } else {
      if (!genAI) {
        throw new Error('Gemini client not initialized. Check your GEMINI_API_KEY.');
      }
      
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { responseMimeType: 'application/json' }
      });

      const combinedPrompt = systemInstruction 
        ? `${systemInstruction}\n\nUser Request/Content:\n${prompt}`
        : prompt;

      const response = await model.generateContent(combinedPrompt);
      resultString = response.response.text();
    }

    const cleaned = cleanJsonString(resultString);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('AI Completion API error:', error);
    throw new Error(`AI completion failed: ${error.message}`);
  }
};
