import React from 'react';
import { PetData } from '../types';
import TarotDraw from './TarotDraw';
import '../styles/TarotDraw.css';
import '../styles/MainScreen.css';

interface MainScreenProps {
  petData: PetData;
  setPetData: (data: PetData) => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ petData/*, setPetData*/ }) => {
  return (
    <div className="main-screen">
      <h1>Welcome, {petData.name}!</h1>
      <TarotDraw petData={petData} />
    </div>
  );
};

export default MainScreen;
