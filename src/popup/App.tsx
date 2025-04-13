import { useEffect, useState } from 'react'
import { PetData } from './types'
import { loadPetData } from './storage'
import MainScreen from './components/MainScreen'
import StartScreen from './components/StartScreen'
import './styles/App.css'

// const defaultPetData: PetData = {
//   animalType: '',
//   name: '',
//   lastBreak: Date.now(),
//   nextBreak: Date.now() + 3600000,
//   budget: 100,
//   coins: 0,
//   goals: [],
//   streaks: 0,
//   prestige: 0,
//   HP: 100,
//   morale: 100,
//   XP: 0,
//   highScore: 0
// }

export default function App() {
  const [petData, setPetData] = useState<PetData | null>(null)
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

  return <MainScreen petData={petData} setPetData={setPetData} />
}
