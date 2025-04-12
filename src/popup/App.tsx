import { useState } from 'react'
import MainScreen from './components/MainScreen'

const sampleData = {
  animalType: 'cat',
  name: 'Mochi',
  lastBreak: Date.now(),
  nextBreak: Date.now() + 3600000,
  budget: 100,
  coins: 25,
  goals: [
    { label: 'Eat food', completed: false },
    { label: 'Drink water', completed: false }
  ],
  streaks: 2,
  prestige: 1,
  HP: 80,
  morale: 60,
  XP: 30,
  highScore: 200
}

export default function App() {
  const [petData, setPetData] = useState(sampleData)

  return (
    <MainScreen petData={petData} setPetData={setPetData} />
  )
}
