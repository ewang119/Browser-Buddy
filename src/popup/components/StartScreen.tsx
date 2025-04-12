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
  // const [animalType, setAnimalType] = useState('cat'); 
  const [error, setError] = useState<string | null>(null)
  const [current, setCurrent] = useState(0)

  const animals = [
    { path: '/animal-gifs/dog.gif', type: 'dog' },
    { path: '/animal-gifs/cat.gif', type: 'cat' },
    { path: '/animal-gifs/owl.gif', type: 'owl' },
    { path: '/animal-gifs/capybara.gif', type: 'capybara' },
    { path: '/animal-gifs/quokka.gif', type: 'quokka' }
  ];

  type ImageSliderProps = {
    current: number;
    setCurrent: React.Dispatch<React.SetStateAction<number>>;
  };

  const ImageSlider = ({ current, setCurrent }: ImageSliderProps) => {

    const animals = [
      { path: '/animal-gifs/dog.gif', type: 'dog' },
      { path: '/animal-gifs/cat.gif', type: 'cat' },
      { path: '/animal-gifs/owl.gif', type: 'owl' },
      { path: '/animal-gifs/capybara.gif', type: 'capybara' },
      { path: '/animal-gifs/quokka.gif', type: 'quokka' }
    ];
    const length = animals.length;

    const nextSlide = () => {
      setCurrent(prev => (prev === length - 1 ? 0 : prev + 1));
    };
    
    const prevSlide = () => {
      setCurrent(prev => (prev === 0 ? length - 1 : prev - 1));
    };    

    if (!Array.isArray(animals) || animals.length <= 0) {
        return null;
    }

    // {styles.name}

    return (
      <div className={styles.sliderContainer}> {/* Changed to sliderContainer */}
        <div className={styles.container}>
          <FaArrowLeft className={styles.leftArrow} onClick={prevSlide} />
          <div className={styles.imageBox}>
            <img 
              src={animals[current].path} 
              alt={animals[current].type} 
              className={styles.image} 
            />
          </div>
          <FaArrowRight className={styles.rightArrow} onClick={nextSlide} />
        </div>
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
        animalType: animals[current].type,
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

      <ImageSlider current={current} setCurrent={setCurrent} />


      <button onClick={handleSubmit}>Start!</button>
    </div>
  )
}
