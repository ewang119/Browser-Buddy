// src/popup/components/StartScreen.tsx

import { useState } from 'react'
import type { PetData } from '../types'
import { savePetData } from '../storage'
import '../styles/StartScreen.css'
import styles from '../styles/start.module.css'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'

type Props = {
  setPetData: (data: PetData) => void
}

export default function StartScreen({ setPetData }: Props) {
  const [name, setName] = useState('')
  const [animalType, setAnimalType] = useState('cat')
  const [error, setError] = useState<string | null>(null)

  const ImageSlider = () => {

    const [current, setCurrent] = useState(0);
    const animals = ['/animal-gifs/dog.gif', '/animal-gifs/cat.gif', '/animal-gifs/owl.gif', '/animal-gifs/capybara.gif', '/animal-gifs/quokka.gif' ]
    console.log(animals)
    const length = animals.length;

    const nextSlide = () => {
      setCurrent(current === length - 1 ? 0 : current + 1)
    }

    const prevSlide = () => {
      setCurrent(current === 0 ? length - 1 : current - 1);
    }

    if (!Array.isArray(animals) || animals.length <= 0) {
        return null;
    }
    // {styles.name}
    return (
        <div className={styles.container}>
            <FaArrowLeft className={styles.leftArrow} onClick={prevSlide} />
            <div className={styles.imageBox}>
                <img src={animals[current]} alt={animals[current].substring(1, animals[current].lastIndexOf('.'))} className={styles.image} />
            </div>
            <FaArrowRight className={styles.rightArrow} onClick={nextSlide} />
        </div>
        );
    };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a name for your pet')
      return
    }

    try {
      const now = Date.now()
      const data: PetData = {
        animalType,
        name,
        lastBreak: now,
        nextBreak: now + 25 * 60 * 1000,
        budget: 0,
        coins: 0,
        goals: [],
        streaks: 0,
        prestige: 0,
        HP: 100,
        morale: 100,
        XP: 0,
        highScore: 0,
        lastXPReset: now,
        timerState: {
          timeLeft: 25 * 60,
          isRunning: false,
          isBreak: false,
          sessionCompleted: false,
          lastBreakTime: now,
          lastUpdate: now
        }
      }

      await savePetData(data)
      setPetData(data)
    } catch (error) {
      console.error('Error saving pet data:', error)
      setError('Failed to save pet data. Please try again.')
    }
  }

  return (
    <div className="start-screen">
      <h2>Welcome to Browser Pet!</h2>

      {error && <p className="error-message">{error}</p>}

      <label>
        Name your pet:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mochi"
        />
      </label>

      <ImageSlider />

      <label>
        Choose animal:
        <select value={animalType} onChange={(e) => setAnimalType(e.target.value)}>
          <option value="cat">Cat</option>
          <option value="dog">Dog</option>
        </select>
      </label>

      <button onClick={handleSubmit}>Start!</button>
    </div>
  )
}
