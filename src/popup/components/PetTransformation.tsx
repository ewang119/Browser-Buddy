import React, { useState, useEffect } from 'react';
import { PetData } from '../types';
import { generateTarotReading } from '../api/gemini';
import './styles/PetTransformation.css';

interface Transformation {
  name: string;
  type: string;
  story: string;
  image: string;
}

const PRESTIGE_THRESHOLDS = [
  { days: 30, title: 'Celestial Guardian' },
  { days: 60, title: 'Cosmic Sage' },
  { days: 90, title: 'Stellar Sovereign' },
  { days: 120, title: 'Galactic Archon' }
];

interface PetTransformationProps {
  petData: PetData;
  onClose: () => void;
}

const PetTransformation: React.FC<PetTransformationProps> = ({ petData, onClose }) => {
  const [transformation, setTransformation] = useState<Transformation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkTransformation = async () => {
      const currentPrestige = PRESTIGE_THRESHOLDS.find(
        threshold => petData.streaks >= threshold.days
      );

      if (currentPrestige && (!petData.prestige || petData.prestige < currentPrestige.days)) {
        try {
          const prompt = `Create a transformation story for a pet that has achieved ${currentPrestige.days} days of self-care. 
            The pet's current name is ${petData.name}. 
            Generate a new mythical name, describe its transformed appearance, and create a personal backstory that reflects the user's journey.
            Format the response as JSON with fields: name, type, story, image.`;

          const response = await generateTarotReading(prompt);
          const data = JSON.parse(response);
          
          setTransformation({
            name: data.name,
            type: currentPrestige.title,
            story: data.story,
            image: data.image
          });

          // Update pet data with new prestige level
          petData.prestige = currentPrestige.days;
          petData.name = data.name;
        } catch (error) {
          console.error('Failed to generate transformation:', error);
        }
      }
      setLoading(false);
    };

    checkTransformation();
  }, [petData]);

  if (loading) {
    return (
      <div className="transformation-modal">
        <div className="transformation-content">
          <div className="transformation-header">
            <h2>Analyzing Your Journey</h2>
            <p className="prestige-title">Preparing Transformation...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transformation) {
    return null;
  }

  return (
    <div className="transformation-modal">
      <div className="transformation-content">
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="transformation-header">
          <h2>Cosmic Evolution</h2>
          <p className="prestige-title">{transformation.type}</p>
        </div>

        <div className="transformation-details">
          <img 
            src={transformation.image} 
            alt={transformation.name}
            className="transformed-pet"
          />
          <div className="transformation-info">
            <h3>{transformation.name}</h3>
            <p className="transformation-type">{transformation.type}</p>
            <p className="transformation-story">{transformation.story}</p>
          </div>
        </div>

        <div className="transformation-stats">
          <div className="stat">
            <span>Days of Care</span>
            <span className="value">{petData.streaks}</span>
          </div>
          <div className="stat">
            <span>Prestige Level</span>
            <span className="value">{PRESTIGE_THRESHOLDS.findIndex(t => t.days === petData.prestige) + 1}</span>
          </div>
          <div className="stat">
            <span>Morale</span>
            <span className="value">{petData.morale}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetTransformation; 