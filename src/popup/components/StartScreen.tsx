// src/popup/components/StartScreen.tsx

import { useState } from 'react'
import type { PetData } from '../types'
import styles from '../../styles/start.module.css'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'


type Props = {
  setPetData: (data: PetData) => void
}

export default function StartScreen({ setPetData }: Props) {
  const [name, setName] = useState('')
  const [animalType, setAnimalType] = useState('cat')

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

  const handleSubmit = () => {
    if (!name.trim()) return

    const now = Date.now()
    const data: PetData = {
      animalType,
      name,
      lastBreak: now,
      nextBreak: now + 3600000,
      budget: 100,
      coins: 0,
      goals: [
        { label: 'Drink water', completed: false },
        { label: 'Take a walk', completed: false }
      ],
      streaks: 0,
      prestige: 0,
      HP: 100,
      morale: 100,
      XP: 0,
      highScore: 0
    }

    setPetData(data)
  }

  return (
    <div className="start-screen">
      <h2>Welcome to Browser Pet!</h2>

      <label>
        Name your pet:
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sonic"
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
