// src/popup/components/MainScreen.tsx
import '../styles/MainScreen.css'

export default function MainScreen({ petData, setPetData }: any) {
  const toggleGoal = (index: number) => {
    const newGoals = [...petData.goals]
    newGoals[index].completed = !newGoals[index].completed
    setPetData({ ...petData, goals: newGoals })
  }

  const ProgressBar = ({ label, value }: { label: string; value: number }) => (
    <div className="bar">
      <span>{label}</span>
      <div className="track">
        <div className="fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  )

  return (
    <div className="main-screen">
      <h2 className="header">Lv. 1 {petData.name}</h2>

      <img
        src={`/animal-gifs/${petData.animalType}.gif`}
        alt={`${petData.animalType} pet`}
        className="pet-img"
      />

      <div className="stats">
        <ProgressBar label="HP" value={petData.HP} />
        <ProgressBar label="Morale" value={petData.morale} />
        <ProgressBar label="XP" value={petData.XP} />
      </div>

      <div className="goals">
        <h3>Goals</h3>
        <ul>
          {petData.goals.map((goal: any, i: number) => (
            <li key={i}>
              <label>
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => toggleGoal(i)}
                />
                {goal.label}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="actions">
        <button>[SHOP]</button>
        <button>[INVENTORY]</button>
        <button>[ENTER DOGFIGHT]</button>
      </div>

      <div className="footer">
        <span>Coins: {petData.coins}</span>
        <span>Prestige: {petData.prestige}</span>
      </div>
    </div>
  )
}
