import { useState } from 'react'

export default function App() {
  const [xp, setXP] = useState(0)

  const gainXP = () => setXP(x => Math.min(100, x + 10))

  return (
    <div className="container">
      <img src="/pet.gif" alt="Pet" className="pet" />
      <div className="xp-bar">
        <div className="xp-fill" style={{ width: `${xp}%` }} />
      </div>
      <button onClick={gainXP}>Feed</button>
    </div>
  )
}
