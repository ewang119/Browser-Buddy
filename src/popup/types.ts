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
  lastXPReset: number
  timerState: {
    timeLeft: number
    isRunning: boolean
    isBreak: boolean
    sessionCompleted: boolean
    lastBreakTime: number
    lastUpdate: number
  }
}
  
export const animals = [
  { path: '/animal-gifs/dog.gif', type: 'dog' },
  { path: '/animal-gifs/cat.gif', type: 'cat' },
  { path: '/animal-gifs/owl.gif', type: 'owl' },
  { path: '/animal-gifs/capybara.gif', type: 'capybara' },
  { path: '/animal-gifs/quokka.gif', type: 'quokka' },
  { path: '/animal-gifs/bears.gif', type: 'bears' },
  { path: '/animal-gifs/crab.gif', type: 'crab' },
  { path: '/animal-gifs/lemur.gif', type: 'lemur' },
];