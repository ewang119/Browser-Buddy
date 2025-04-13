import { useEffect, useState } from 'react'
import { BudgetGoal, PetData,  } from './types'
import { loadPetData, savePetData } from './storage'
import MainScreen from './components/MainScreen'
import StartScreen from './components/StartScreen'
import ShopScreen from './components/ShopScreen'
import DeathScreen from './components/DeathScreen'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './styles/App.css'
import BudgetingPage from './components/Budgeting';


/* const defaultPetData: PetData = {
  animalType: 'dog',
  name: 'Mochi',
  lastBreak: Date.now(),
  nextBreak: Date.now() + 2 * 60 * 1000, // 2 minutes later for testing
  isOnBreak: false,

  budget: 100,
  coins: 0,
  goals: [],
  streaks: 0,
  prestige: 0,
  HP: 100,
  morale: 100,
  XP: 0,
  highScore: 0
} */

export default function App() {
  const [petData, setPetData] = useState<PetData | null>(null)
  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([
    {
      label: "Rent",
      description: "Monthly rent payment",
      tags: ["Rent", "High Priority"],
      amountAllocated: 800,
      goalAmount: 1000,
      completed: false
    },
    {
      label: "Vacation",
      description: "Save for a summer vacation",
      tags: ["Vacation", "Low Priority"],
      amountAllocated: 300,
      goalAmount: 1500,
      completed: false
    },
    {
      label: "Emergency Fund",
      description: "Build an emergency fund for unexpected expenses",
      tags: ["Emergency", "High Priority"],
      amountAllocated: 500,
      goalAmount: 2000,
      completed: false
    }
  ]);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const data = await loadPetData()
        if (data) {
          setPetData(data)
        }
      } catch (error) {
        console.error('Error loading pet data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPetData()
  }, [])

  useEffect(() => {
    if (petData) {
      savePetData(petData);
    }
  }, [petData]);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <p>Loading your companion...</p>
      </div>
    )
  }

  if (!petData || !petData.name) {
    return <StartScreen setPetData={setPetData} />
  }

  return (
    <Router basename="/popup.html">
      <Routes>
        <Route path="/" element={<MainScreen petData={petData} setPetData={(data) => setPetData(data as PetData)} />} />
        <Route path="/shop" element={<ShopScreen petData={petData} setPetData={setPetData} />} />
        <Route path="/start" element={<StartScreen setPetData={setPetData} />} />
        <Route path="/death" element={<DeathScreen petData={petData} setPetData={(data) => setPetData(data as PetData)} />} />
        <Route path="/budgeting" element={<BudgetingPage petData={petData!} budgetingGoals={budgetGoals!} setBudgetGoals={setBudgetGoals}/>} />
        <Route path="/start" element={<StartScreen setPetData={setPetData} />} />
      
      </Routes>
    </Router>
  )
}
