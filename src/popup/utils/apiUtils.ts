export async function fetchGeminiApi(endpoint: string, apiKey: string, body: object): Promise<Response> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors', // Use no-cors mode
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    // Note: Response will be opaque due to no-cors mode
    if (!response.ok) {
      throw new Error(`Failed to fetch Gemini API at endpoint "${endpoint}". HTTP Status: ${response.status} - ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.error('Error fetching Gemini API:', error);
    throw new Error(`Failed to fetch Gemini API at endpoint "${endpoint}". Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
