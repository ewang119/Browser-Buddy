import { useState } from "react";
import { PetData } from '../types'
import { IoArrowBackSharp } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import styles from '../styles/shop.module.css'

interface ShopScreenProps {
  petData: PetData;
  setPetData: (data: PetData) => void;
}

export default function ShopScreen({ petData, setPetData }: ShopScreenProps) {
    const [popupMessage, setPopupMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const shopItems = [
        { item: "Medkit", description: "+25 HP", image: "/medkit.png", price: 150 }, 
        { item: "Scores", description: "+25 XP", image: "/xp.png", price: 150 },
        { item: "Angel", description: "+25 Morale", image: "/angel.png", price: 150 }, 
        { item: "Mystery", description: "??????", image: "/mysteryBox.gif", price: 300 },  
    ];

    return (
        <div className={styles.shopContainer}>
            <IoArrowBackSharp className={styles.backArrow} onClick={() => navigate('/')}/>

            {popupMessage && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popupBox}>
                    <p className={styles.popupmessage}>{popupMessage}</p>
                    <button onClick={() => setPopupMessage(null)}>Close</button>
                    </div>
                </div>
            )}

          <header className={styles.header}>
            <h1 className={styles.title}>Shop</h1>
            <div className={styles.tokenDisplay}>
                <img src="/token.png" alt="Coins" className={styles.tokenImage} /> {petData.coins} 
            </div>
          </header>

          <div className={styles.grid}>
            {shopItems.map(item => (
              <div key={item.item} className={styles.gridItem} 
                onClick={() => {
                    if (petData.coins >= item.price) {
                        if (item.item === 'Mystery') {
                            const types = [ 'HP', 'morale', 'XP']
                            const scores = [ 10, -10, 20, -20, 30, -30, 40, -40, 50, -50]
                            const num1 = Math.floor(Math.random() * 3); 
                            const num2 = Math.floor(Math.random() * 10); 
                            const stat = types[num1]
                            const change = scores[num2]

                            setPetData({
                                ...petData, 
                                [stat]: Math.max(stat === 'HP' ? 1 : 0, Math.min(100, (petData[stat as keyof PetData] as number) + change)),
                                coins: petData.coins - item.price,
                            })
                            setPopupMessage(`Congrats on ` + change +  ` ` + stat + `!!!`);
                        } else if (typeof item.item === 'string') {
                            setPetData({
                                ...petData,
                                [item.item]: Math.max(0, Math.min(100, (petData[item.item as keyof PetData] as number) + 25)),
                                coins: petData.coins - item.price,
                            });
                            setPopupMessage(`You bought ${item.item} wow`);
                        }
                    } else {
                      setPopupMessage(`You can't buy ${item.item} broski`);
                    }
                    // setSelected(item.item);
                  }}
                >
                <p className={styles.itemName}>{item.item} <br /> <span className={styles.itemSubheading}>{item.price} Tokens</span></p>
                <img src={item.image} alt={`Item ${item.item}`} className={styles.itemImage} />
                <p className={styles.itemDescription}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
}
