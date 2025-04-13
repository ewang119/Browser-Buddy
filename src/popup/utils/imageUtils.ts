export async function extractFrameFromGif(gifPath: string): Promise<string> {
  try {
    // Create an image element
    const img = new Image();

    // Fetch the image with no-cors mode
    const response = await fetch(gifPath, { mode: 'no-cors' });
    if (!response.ok) {
      throw new Error(`Failed to fetch GIF from path "${gifPath}". HTTP Status: ${response.status} - ${response.statusText}`);
    }
    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);

    // Create a promise to handle the image load
    const imageLoadPromise = new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () => reject(new Error(`Failed to load image from object URL: ${objectURL}`));
    });

    // Set the source and wait for it to load
    img.src = objectURL;
    await imageLoadPromise;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw the image onto the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context. Ensure the browser supports canvas operations.');
    }
    ctx.drawImage(img, 0, 0);

    // Return the frame as a data URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error extracting frame from GIF:', error);
    throw new Error(`Failed to extract frame from GIF at path "${gifPath}". Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}
