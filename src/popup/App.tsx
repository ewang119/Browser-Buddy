import { useEffect, useState } from 'react'
import { PetData } from './types'
import { loadPetData, savePetData } from './storage'
import MainScreen from './components/MainScreen'
import StartScreen from './components/StartScreen'

const defaultPetData: PetData = {
  animalType: '',
  name: '',
  lastBreak: Date.now(),
  nextBreak: Date.now() + 3600000,
  budget: 100,
  coins: 0,
  goals: [],
  streaks: 0,
  prestige: 0,
  HP: 100,
  morale: 100,
  XP: 0,
  highScore: 0
}

export default function App() {
  const [petData, setPetDataState] = useState<PetData>(defaultPetData)

  useEffect(() => {
    loadPetData().then((data) => {
      if (data) setPetDataState(data)
    })
  }, [])

  const setPetData = (data: PetData) => {
    setPetDataState(data)
    savePetData(data)
  }

  return petData.name === '' ? (
    <StartScreen setPetData={setPetData} />
  ) : (
    <MainScreen />
  )
}
