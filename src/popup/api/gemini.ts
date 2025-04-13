const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-01-21:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
  }>;
  promptFeedback?: {
    safetyRatings: Array<{
      category: string;
      probability: string;
    }>;
  };
}

export async function generateTarotReading(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error Response:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate tarot reading');
    }

    const data: GeminiResponse = await response.json();
    console.log('API Response:', data);
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from Gemini API');
    }

    const text = data.candidates[0].content.parts[0].text;
    if (!text.trim()) {
      throw new Error('Empty response from Gemini API');
    }

    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate tarot reading: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while generating the tarot reading');
  }
} 