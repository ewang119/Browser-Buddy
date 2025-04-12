export default function MainScreen({ petData, setPetData }: any) {
    const gainXP = () => {
      const updated = { ...petData, XP: petData.XP + 10 }
      setPetData(updated)
    }
  
    return (
      <div>
        <h2>{petData.name} the {petData.animalType}</h2>
        <p>XP: {petData.XP}</p>
        <button onClick={gainXP}>Feed (gain XP)</button>
      </div>
    )
}
  