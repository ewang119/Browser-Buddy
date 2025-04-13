import React from "react";

interface ProgressBarProps {
  progress: number; // Progress percentage (0-100)
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
  return (
    <div style={{ width: "100%", backgroundColor: "#e0e0e0", borderRadius: "5px" }}>
      <div
        style={{
          width: `${progress}%`,
          backgroundColor: "#76c7c0",
          height: "10px",
          borderRadius: "5px",
        }}
      ></div>
    </div>
  );
};

export default ProgressBar;
