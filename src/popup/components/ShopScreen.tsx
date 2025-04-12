import { useState } from "react";
// import { PetData } from '../types'
import styles from '../styles/shop.module.css'

export default function ShopScreen() {

    const [selected, setSelected] = useState<string | null>(null); 

    const shopItems = [
        { item: "Medkit1", description: "+10 HP", image: "/medkit.png", price: 100 }, 
        { item: "Medkit2", description: "-10 HP", image: "/medkit.png", price: 200 }, 
        { item: "Medkit3", description: "-10 XP", image: "/medkit.png", price: 300 }, 
        { item: "Medkit4", description: "+10 XP", image: "/medkit.png", price: 400 }, 
    ];

    return (
        <div className={styles.shopContainer}>
          <header className={styles.header}>
            <h1 className={styles.title}>Shop</h1>

            <div className={styles.tokenDisplay}>
                <img src="token.png" alt="Coins" className={styles.tokenImage} /> 17
            </div>
          </header>
          <div className={styles.grid}>
            {shopItems.map(item => (
              <div key={item.item} className={styles.gridItem} onClick={() => setSelected(item.item)}>
                <p className={styles.itemName}>{item.item} <br /> <span className={styles.itemSubheading}>{item.price} Tokens</span></p>
                <p>{selected}</p>
                <img src={item.image} alt={`Item ${item.item}`} className={styles.itemImage} />
                <p className={styles.itemDescription}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
}
