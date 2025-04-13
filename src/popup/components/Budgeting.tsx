import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BudgetingPage.css';
import { PetData, BudgetGoal } from '../types';
import { generateGeminiImagesWithBase } from '../api/gemini'; // Import the function
import { extractFrameFromGif } from '../utils/imageUtils'; // Import utility for extracting frames

interface BudgetingPageProps {
  petData: PetData;
  budgetingGoals: BudgetGoal[];
  setBudgetGoals: React.Dispatch<React.SetStateAction<BudgetGoal[]>>;
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

const BudgetingPage: React.FC<BudgetingPageProps> = ({ petData, budgetingGoals, setBudgetGoals }) => {
  const [currentTip, setCurrentTip] = useState('');
  const [newGoal, setNewGoal] = useState<BudgetGoal>({
    label: '',
    description: '',
    tags: [],
    amountAllocated: 0,
    goalAmount: 0,
    completed: false
  });
  const [addAmounts, setAddAmounts] = useState<{ [key: string]: number }>({}); // Track input for adding money
  const [showAddGoalModal, setShowAddGoalModal] = useState(false); // State to toggle modal visibility
  const [slideshowImages, setSlideshowImages] = useState<string[]>([]);
  const [showSlideshow, setShowSlideshow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * BUDGETING_TIPS.length);
    setCurrentTip(BUDGETING_TIPS[randomIndex]);
  }, []);

  const handleAddGoal = () => {
    if (!newGoal.label || !newGoal.description || newGoal.goalAmount <= 0) {
      alert('Please fill out all fields and ensure the goal amount is greater than 0.');
      return;
    }
    setBudgetGoals([...budgetingGoals, newGoal]);
    setNewGoal({
      label: '',
      description: '',
      tags: [],
      amountAllocated: 0,
      goalAmount: 0,
      completed: false
    });
  };

  const handleInputChange = (field: keyof BudgetGoal, value: any) => {
    setNewGoal({ ...newGoal, [field]: value });
  };

  const handleAddMoney = async (label: string) => {
    const amountToAdd = addAmounts[label] || 0;
    if (amountToAdd <= 0) {
      alert('Please enter a valid amount to add.');
      return;
    }

    const updatedGoals = budgetingGoals.map((goal) =>
      goal.label === label
        ? {
            ...goal,
            amountAllocated: Math.min(goal.amountAllocated + amountToAdd, goal.goalAmount)
          }
        : goal
    );

    setBudgetGoals(updatedGoals);
    setAddAmounts({ ...addAmounts, [label]: 0 });

    // Trigger positive image generation
    try {
      setIsLoading(true);
      const prompt = `Generate a positive series of images of a ${petData.animalType} named ${petData.name} celebrating progress. The images should be associated with the goal of ${label}.`;

      // Use a relative or absolute URL for the GIF file
      const baseImagePath = await extractFrameFromGif(`/animal-gifs/${petData.animalType}.gif`);
      
      const { imagePaths } = await generateGeminiImagesWithBase(prompt, baseImagePath);
      setSlideshowImages(imagePaths);
      setShowSlideshow(true);
    } catch (error) {
      console.error('Error generating images:', error);
      setError('Failed to generate images. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMoney = async (label: string) => {
    const amountToRemove = addAmounts[label] || 0;
    if (amountToRemove <= 0) {
      alert('Please enter a valid amount to remove.');
      return;
    }

    const updatedGoals = budgetingGoals.map((goal) =>
      goal.label === label
        ? {
            ...goal,
            amountAllocated: Math.max(goal.amountAllocated - amountToRemove, 0)
          }
        : goal
    );

    setBudgetGoals(updatedGoals);
    setAddAmounts({ ...addAmounts, [label]: 0 });

    // Trigger negative image generation
    try {
      setIsLoading(true);
      const prompt = `Generate a reflective series of images of a ${petData.animalType} named ${petData.name} showing disappointment or setbacks. The images should be associated with failing the goal of ${label}.`;

      // Use a relative or absolute URL for the GIF file
      const baseImagePath = await extractFrameFromGif(`/animal-gifs/${petData.animalType}.gif`);

      const { imagePaths } = await generateGeminiImagesWithBase(prompt, baseImagePath);
      setSlideshowImages(imagePaths);
      setShowSlideshow(true);
    } catch (error) {
      console.error('Error generating images:', error);
      setError('Failed to generate images. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAmountChange = (label: string, value: number) => {
    setAddAmounts({ ...addAmounts, [label]: value });
  };

  return (
    <div className="budgeting-page">
      <div className="budgeting-content">
        <h2 className="page-title">Budgeting Tips 💰</h2>
        <p className="time-greeting">Hello, {petData.name}!</p>
        <p className="budgeting-tip">{currentTip}</p>
        <p className="coins-info">You currently have <strong>{petData.coins}</strong> coins.</p>

        {/* Display Budget Goals */}
        <div className="budget-goals">
          <h3>Your Budget Goals</h3>
          {budgetingGoals.map((goal, index) => (
            <div key={index} className="budget-goal-item">
              <h4>{goal.label}</h4>
              <p>{goal.description}</p>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(goal.amountAllocated / goal.goalAmount) * 100}%` }}
                ></div>
              </div>
              <p>
                Allocated: ${goal.amountAllocated} / Goal: ${goal.goalAmount}
              </p>
              <div className="add-money">
                <input
                  type="number"
                  min="0"
                  value={addAmounts[goal.label] || ''}
                  placeholder="Add/Remove amount"
                  onChange={(e) => handleAddAmountChange(goal.label, Number(e.target.value))}
                />
                <button onClick={() => handleAddMoney(goal.label)}>Add Money</button>
                <button onClick={() => handleRemoveMoney(goal.label)}>Remove Money</button>
              </div>
            </div>
          ))}
        </div>

        {/* Button to open Add Goal Modal */}
        <button className="open-add-goal-button" onClick={() => setShowAddGoalModal(true)}>
          ➕ Add New Goal
        </button>

        {/* Add Goal Modal */}
        {showAddGoalModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-modal-button" onClick={() => setShowAddGoalModal(false)}>
                ×
              </button>
              <h3>Add a New Budget Goal</h3>
              <label>
                Label:
                <input
                  type="text"
                  value={newGoal.label}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                />
              </label>
              <label>
                Description:
                <input
                  type="text"
                  value={newGoal.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </label>
              <label>
                Tags (comma-separated):
                <input
                  type="text"
                  value={newGoal.tags.join(', ')}
                  onChange={(e) =>
                  handleInputChange('tags', e.target.value.split(',').map((tag) => tag.trim()))
                }
                />
              </label>
              <label>
                Allocated Amount:
                <input
                  type="number"
                  value={newGoal.amountAllocated}
                  onChange={(e) => handleInputChange('amountAllocated', Number(e.target.value))}
                />
              </label>
              <label>
                Goal Amount:
                <input
                  type="number"
                  value={newGoal.goalAmount}
                  onChange={(e) => handleInputChange('goalAmount', Number(e.target.value))}
                />
              </label>
              <button className="add-goal-button" onClick={handleAddGoal}>Add Goal</button>
            </div>
          </div>
        )}

        {/* Slideshow Modal */}
        {showSlideshow && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-modal-button" onClick={() => setShowSlideshow(false)}>
                ×
              </button>
              <div className="slideshow">
                {slideshowImages.map((image, index) => (
                  <img 
                    key={index} 
                    src={image} 
                    alt={`Slide ${index + 1}`} 
                    className="slideshow-image"
                    style={{ maxWidth: '100%', height: 'auto' }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="loading-overlay">
            <p>Loading...</p>
          </div>
        )}

        <button
          className="back-button"
          onClick={() => navigate('/')} // Navigate back to the main screen
        >
          Back to Main Screen
        </button>
      </div>
      <style>
        {`
          .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 1.5rem;
            z-index: 1000;
          }
        `}
      </style>
    </div>
  );
};

export default BudgetingPage;