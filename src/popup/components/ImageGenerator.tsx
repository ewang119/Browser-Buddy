import React, { useState } from "react";
import { generateGeminiImagesWithBase } from "../api/gemini";
import { getImagesFromDirectory } from "../utils/fileUtils";
import ProgressBar from "./ProgressBar";

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateImages = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      const result = await generateGeminiImagesWithBase(prompt, undefined, 5);
      setImages(result.imagePaths || []);
      setProgress(100);
    } catch (error) {
      console.error("Error generating images:", error);
      alert("Failed to generate images. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDirectoryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const imagePaths = await getImagesFromDirectory(event.target.files);
      setImages(imagePaths);
    }
  };

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt here..."
        rows={4}
        style={{ width: "100%", marginBottom: "10px" }}
      />
      <button onClick={handleGenerateImages} disabled={isGenerating}>
        {isGenerating ? "Generating..." : "Generate Images"}
      </button>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleDirectoryUpload}
        style={{ marginTop: "10px" }}
      />
      {isGenerating && <ProgressBar progress={progress} />}
      <div style={{ marginTop: "20px" }}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image}
            alt={`Generated ${index}`}
            style={{ width: "100px", height: "100px", margin: "5px" }}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageGenerator;
