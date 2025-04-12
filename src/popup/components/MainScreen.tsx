<<<<<<< HEAD
export default function MainScreen({ petData, setPetData }: any) {
    const gainXP = () => {
      const updated = { ...petData, XP: petData.XP + 10 }
      setPetData(updated)
    }
  
    return (
      <div>
        <h2>{petData.name} the {petData.animalType}</h2>
        <p>XP: {petData.XP}</p>
        <button onClick={gainXP}>Feed (gain XP)</button>
      </div>
    )
}
  
=======
import React, { useEffect, useState } from 'react';
import { PetData } from '../types';
import { loadPetData } from '../storage';
import TarotDraw from './TarotDraw';
import './TarotDraw.css';
import './MainScreen.css';

const MainScreen: React.FC = () => {
  const [petData, setPetData] = useState<PetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const data = await loadPetData();
        if (data) {
          setPetData(data);
        } else {
          // Handle case where no pet data exists
          console.error('No pet data found');
        }
      } catch (error) {
        console.error('Error loading pet data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPetData();
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <p>Loading your companion...</p>
      </div>
    );
  }

  if (!petData) {
    return (
      <div className="error-screen">
        <p>No pet data found. Please set up your companion first.</p>
      </div>
    );
  }

  return (
    <div className="main-screen">
      <h1>Welcome, {petData.name}!</h1>
      <TarotDraw petData={petData} />
    </div>
  );
};

export default MainScreen;
>>>>>>> 09aa555 (gemini and styling)
