import React, { useEffect, useState } from 'react';
import { PetData } from '../types';
import '../styles/WelcomePopup.css';

interface WelcomePopupProps {
  petData: PetData;
  onClose: () => void;
}

const CALMING_MESSAGES = [
  "Take a deep breath. You're doing great.",
  "Every moment is a fresh beginning.",
  "You are exactly where you need to be.",
  "Peace begins with a gentle breath.",
  "Let your heart be light and your mind be calm.",
  "You are stronger than you think.",
  "This moment is perfect, just as it is.",
  "Be gentle with yourself today.",
  "You are enough, just as you are.",
  "Let peace fill your heart and mind.",
  "Today is a gift. Be present in it.",
  "You are surrounded by love and light.",
  "Trust the journey, one step at a time.",
  "Your presence is a gift to the world.",
  "Breathe in peace, breathe out love."
];

const WelcomePopup: React.FC<WelcomePopupProps> = ({ petData, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [currentMessage, setCurrentMessage] = useState('');

  useEffect(() => {
    // Select a random message when the component mounts
    const randomIndex = Math.floor(Math.random() * CALMING_MESSAGES.length);
    setCurrentMessage(CALMING_MESSAGES[randomIndex]);

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 4000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  };

  const getWelcomeMessage = () => {
    const timeOfDay = getTimeOfDay();
    // const streakMessage = petData.streaks > 0 
    //   ? `You're on a ${petData.streaks} day streak! Keep it up!` 
    //   : "Let's start a new streak today!";

    // return `Good ${timeOfDay}, ${petData.name}! ${streakMessage}`;
    return `Good ${timeOfDay}, ${petData.name}.`
  };

  if (!isVisible) return null;

  return (
    <div className="welcome-popup">
      <div className="welcome-content">
        <h2>Welcome Back! 🌟</h2>
        <p className="time-greeting">{getWelcomeMessage()}</p>
        <p className="calming-message">{currentMessage}</p>
        <button className="close-button" onClick={() => {
          setIsVisible(false);
          onClose();
        }}>
          ×
        </button>
      </div>
    </div>
  );
};

export default WelcomePopup; 