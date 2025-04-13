import React, { useEffect, useState } from 'react';
import { PetData } from '../types';
import { generateTarotReading } from '../api/gemini';
import '../styles/PetMood.css';

interface PetMoodProps {
  petData: PetData;
}

type PetMood = 'supportive' | 'worried' | 'restless' | 'wise';

const MOOD_EMOJIS = {
  supportive: '🧸',
  worried: '🐉',
  restless: '🌪️',
  wise: '🦉'
};

const MOOD_DESCRIPTIONS = {
  supportive: 'Your pet is feeling supportive and encouraging',
  worried: 'Your pet is concerned about your well-being',
  restless: 'Your pet is feeling a bit restless and wants to help',
  wise: 'Your pet is feeling wise and reflective'
};

const PetMood: React.FC<PetMoodProps> = ({ petData }) => {
  const [mood, setMood] = useState<PetMood>('supportive');
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const analyzeMood = async () => {
      try {
        const prompt = `Analyze the following pet data and determine the most appropriate mood and message:
        - Streaks: ${petData.streaks}
        - Morale: ${petData.morale}
        - HP: ${petData.HP}
        - Goals completed: ${petData.goals.filter(g => g.completed).length}/${petData.goals.length}
        
        Based on this data, determine if the pet should be:
        1. Supportive (when doing well)
        2. Worried (when overworking)
        3. Restless (when inconsistent)
        4. Wise (when thoughtful & balanced)
        
        Return the response in this exact format:
        MOOD: [one of: supportive, worried, restless, wise]
        MESSAGE: [a short, personalized message based on the mood]`;

        const response = await generateTarotReading(prompt);
        const [moodLine, messageLine] = response.split('\n');
        const newMood = moodLine.split(': ')[1].trim() as PetMood;
        const newMessage = messageLine.split(': ')[1].trim();

        setMood(newMood);
        setMessage(newMessage);
      } catch (error) {
        console.error('Error analyzing pet mood:', error);
        setMood('supportive');
        setMessage("I'm here to support you!");
      } finally {
        setIsLoading(false);
      }
    };

    // Only analyze mood once when component mounts
    analyzeMood();
  }, []); // Empty dependency array means this effect only runs once on mount

  if (isLoading) {
    return (
      <div className="pet-mood loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className={`pet-mood ${mood}`}>
      <div className="mood-icon">{MOOD_EMOJIS[mood]}</div>
      <div className="mood-content">
        <h3>{MOOD_DESCRIPTIONS[mood]}</h3>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default PetMood; 