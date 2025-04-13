// const GEMINI_API_KEY = "AIzaSyAdoRJpM0dbN9lJ15M0FaF5HR-HoMksFeQ";
const GEMINI_API_KEY = "AIzaSyA-ixYu5oPYphtcYQkpcUWJO0DZuFT0QH8"
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-thinking-exp-01-21:generateContent';
const GEMINI_IMAGE_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent"

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

interface GeminiImageResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
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
      throw new Error(`Failed to generate tarot reading. HTTP Status: ${response.status} - ${response.statusText}. Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data: GeminiResponse = await response.json();
    console.log('API Response:', data);
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format from Gemini API');
    }

    const text = data.candidates[0].content.parts[0].text;
    if (!text.trim()) {
      throw new Error('Empty response from Gemini API. Ensure the prompt is valid and try again.');
    }

    return text;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw new Error(`Failed to generate tarot reading. Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function generateGeminiImagesWithBase(
  prompt: string,
  baseImagePath?: string,
  numImages: number = 5
): Promise<{ text?: string; imagePaths: string[] }> {
  if (numImages < 1 || numImages > 10) {
    throw new Error("Number of images must be between 1 and 10.");
  }

  try {
    // Prepare the base image if provided
    let base64Image: string | undefined;
    if (baseImagePath) {
      // If the baseImagePath is already a data URL, use it directly
      if (baseImagePath.startsWith('data:')) {
        base64Image = baseImagePath;
      } else {
        // Otherwise, fetch the image and convert it to base64
        const response = await fetch(baseImagePath);
        const blob = await response.blob();
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }
    }

    const temp = JSON.stringify({
      contents: [
        {
          parts: [
            { text: prompt },
            ...(base64Image
              ? [
                  {
                    inlineData: {
                      mimeType: "image/png",
                      data: base64Image.split(',')[1], // Remove the data URL prefix
                    },
                  },

                ]
              : []),
          ],
        },
      ],
      generationConfig: {
        responseModalities: ["Text", "Image"],
      },
    })
    console.log("Request Body:", temp);
    // Make the API request
    const response = await fetch(`${GEMINI_IMAGE_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: temp
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(
        `Failed to generate images. HTTP Status: ${response.status} - ${response.statusText}. Error: ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const data: GeminiImageResponse = await response.json();

    // Process the response
    const result: { text?: string; imagePaths: string[] } = { imagePaths: [] };
    for (const part of data.candidates[0].content.parts) {
      console.log("Part:", part);
      if (part.text) {
        result.text = part.text;
      }
      if (part.inlineData) {
        // Convert base64 to data URL
        const imageData = `data:image/png;base64,${part.inlineData.data}`;
        result.imagePaths.push(imageData);
      }
    }

    if (result.imagePaths.length === 0 && !result.text) {
      throw new Error("Empty response from Gemini API. Ensure the prompt is valid and try again.");
    }

    return result; // Return the result object
  } catch (error) {
    console.error("Error generating images:", error);
    throw new Error(
      `Failed to generate images. Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
