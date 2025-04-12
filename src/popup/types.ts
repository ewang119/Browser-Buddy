
export interface Goal {
    label: string
    completed: boolean
  }
  
  export interface PetData {
    animalType: string
    name: string
    lastBreak: number
    nextBreak: number
    budget: number
    coins: number
    goals: Goal[]
    streaks: number
    prestige: number
    HP: number
    morale: number
    XP: number
    highScore: number
  }
  