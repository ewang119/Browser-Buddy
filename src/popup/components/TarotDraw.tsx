import React, { useState } from 'react';
import { PetData } from '../types';
// import { loadPetData } from '../storage';
import { generateTarotReading } from '../api/gemini';
import './TarotDraw.css';

interface TarotDrawProps {
  petData: PetData;
}

const TarotDraw: React.FC<TarotDrawProps> = ({ petData }) => {
  const [tarotReading, setTarotReading] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  };

  const generateTarotReadingHandler = async () => {
    setIsLoading(true);
    try {
      const timeOfDay = getTimeOfDay();
      const prompt = `Generate a gentle, poetic tarot reading for a ${petData.animalType} named ${petData.name}. 
      Consider that it's ${timeOfDay}, their morale is ${petData.morale}, and they have ${petData.streaks} streaks. 
      Make it reflective and metaphorical, not advice-giving. Format it like a tarot card reading with a title and message.
      Example format:
      "You drew: The Stilled Wind
      Sometimes, stillness is the loudest kind of progress."`;

      const reading = await generateTarotReading(prompt);
      setTarotReading(reading);
    } catch (error) {
      console.error('Error generating tarot reading:', error);
      setTarotReading('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tarot-draw">
      <button 
        onClick={generateTarotReadingHandler}
        disabled={isLoading}
        className="tarot-button"
      >
        {isLoading ? 'Drawing...' : '✨ Tarot Draw'}
      </button>
      
      {tarotReading && (
        <div className="tarot-reading">
          <p>{tarotReading}</p>
        </div>
      )}
    </div>
  );
};

export default TarotDraw; 