import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BudgetingPage.css';

interface BudgetingPageProps {
  petData: {
    name: string;
    coins: number;
  };
}

const BUDGETING_TIPS = [
  "Track your expenses daily to stay on top of your budget.",
  "Set realistic financial goals and stick to them.",
  "Save at least 20% of your income for future needs.",
  "Avoid impulse purchases by waiting 24 hours before buying.",
  "Create a monthly budget and review it regularly.",
  "Use cash for discretionary spending to limit overspending.",
  "Automate your savings to make it a habit.",
  "Cut unnecessary subscriptions to save money.",
  "Plan your meals to avoid overspending on food.",
  "Review your financial progress at the end of each month."
];

const BudgetingPage: React.FC<BudgetingPageProps> = ({ petData }) => {
  const [currentTip, setCurrentTip] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Select a random budgeting tip when the component mounts
    const randomIndex = Math.floor(Math.random() * BUDGETING_TIPS.length);
    setCurrentTip(BUDGETING_TIPS[randomIndex]);
  }, []);

  return (
    <div className="budgeting-page">
      <div className="budgeting-content">
        <h2>Budgeting Tips 💰</h2>
        <p className="time-greeting">Hello, {petData.name}!</p>
        <p className="budgeting-tip">{currentTip}</p>
        <p className="coins-info">You currently have {petData.coins} coins.</p>
        <button
          className="back-button"
          onClick={() => navigate('/')} // Navigate back to the main screen
        >
          Back to Main Screen
        </button>
      </div>
    </div>
  );
};

export default BudgetingPage;