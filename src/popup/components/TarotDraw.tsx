import React, { useState } from 'react';
import { PetData } from '../types';
import { generateTarotReading } from '../api/gemini';
import '../styles/TarotDraw.css';

interface TarotDrawProps {
  petData: PetData;
  setPetData: (data: PetData) => void;
}

type TarotTheme = 'traditional' | 'nature' | 'mindfulness' | 'creativity';

const THEME_DESCRIPTIONS = {
  traditional: 'classic tarot cards with traditional meanings',
  nature: 'nature-inspired cards with elements and seasons',
  mindfulness: 'cards focused on mental and emotional well-being',
  creativity: 'artistic and imaginative card interpretations'
};

interface TarotCard {
  title: string;
  content: string;
  isFlipped: boolean;
}

const TarotDraw: React.FC<TarotDrawProps> = ({ petData }) => {
  const [tarotCards, setTarotCards] = useState<TarotCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState<TarotTheme>('traditional');

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  };

  const generateTarotReadingHandler = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const timeOfDay = getTimeOfDay();
      const themeDescription = THEME_DESCRIPTIONS[selectedTheme];

      const prompt = `Generate exactly three gentle, poetic tarot readings using ${themeDescription} for a ${petData.animalType} named ${petData.name}. 
      Consider that it's ${timeOfDay}, their morale is ${petData.morale}, and they have ${petData.streaks} streaks. 
      Make them reflective and metaphorical, not advice-giving. Format each reading with a title and message.
      You MUST include only 3 thoughtful sentences for each card description. You need to be creative with names. Do not cut off thoughts.
      You MUST generate exactly 3 cards, no more, no less.
      Separate each card with "---CARD---" and format like this:
      "The Stilled Wind
      Sometimes, stillness is the loudest kind of progress.
      ---CARD---
      The Whispering Leaves
      Listen closely to what the wind carries.
      ---CARD---
      The Dancing Shadows
      Even in darkness, there is movement and grace."`;

      const reading = await generateTarotReading(prompt);
      const cards = reading.split('---CARD---')
        .map(card => {
          const [title, ...content] = card.trim().split('\n');
          return {
            title: title.trim(),
            content: content.join('\n').trim(),
            isFlipped: false
          };
        })
        .filter(card => card.title && card.content) // Filter out empty cards
        .slice(0, 3); // Ensure we only take the first 3 cards
      setTarotCards(cards);
    } catch (error) {
      console.error('Error generating tarot reading:', error);
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          setError('Gemini API key is not configured. Please check your .env file.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (index: number) => {
    setTarotCards(prevCards => 
      prevCards.map((card, i) => 
        i === index ? { ...card, isFlipped: !card.isFlipped } : card
      )
    );
  };

  return (
    <div className="tarot-draw">
      <div className="theme-selector">
        <label htmlFor="tarot-theme">Select Theme:</label>
        <select 
          id="tarot-theme"
          value={selectedTheme} 
          onChange={(e) => setSelectedTheme(e.target.value as TarotTheme)}
          disabled={isLoading}
        >
          <option value="traditional">Traditional Tarot</option>
          <option value="nature">Nature Cards</option>
          <option value="mindfulness">Mindfulness Cards</option>
          <option value="creativity">Creative Cards</option>
        </select>
      </div>

      <button 
        onClick={generateTarotReadingHandler}
        disabled={isLoading}
        className="tarot-button"
      >
        {isLoading ? 'Drawing...' : '✨ Tarot Draw'}
      </button>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {tarotCards.length > 0 && !error && (
        <div className="tarot-cards-container">
          {tarotCards.map((card, index) => (
            <div 
              key={index}
              className={`tarot-card ${card.isFlipped ? 'flipped' : ''}`} 
              onClick={() => handleCardClick(index)}
            >
              <div className="card-front">
                <div className="card-background">
                  <div className="card-pattern"></div>
                  <div className="card-title">Card {index + 1}</div>
                </div>
              </div>
              <div className="card-back">
                <div className="reading-content">
                  <h3>{card.title}</h3>
                  <p>{card.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TarotDraw; 