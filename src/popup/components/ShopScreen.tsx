// import { useState } from "react";
// import { PetData } from '../types'
import styles from '../styles/shop.module.css'

export default function ShopScreen() {

    const shopItems = [
        { item: "Medkit1", description: "Heals 10 HP", image: "medkit.png", price: 100 }, 
        { item: "Medkit2", description: "Heals 10 HP", image: "medkit.png", price: 200 }, 
        { item: "Medkit3", description: "Heals 10 HP", image: "medkit.png", price: 300 }, 
        { item: "Medkit4", description: "Heals 10 HP", image: "medkit.png", price: 400 }, 
    ];

    return (
        <div className={styles.shopContainer}>
          <header className={styles.header}>
            <h1 className={styles.title}>Shop</h1>

            <div className={styles.tokenDisplay}>
                <img src="token.jpg" alt="Coins" className={styles.tokenImage} /> 17
            </div>
          </header>
    
          <div className={styles.grid}>
            {shopItems.map(item => (
              <div key={item.item} className={styles.gridItem}>
                <p className={styles.itemName}>{item.item} <br /> <span className={styles.itemSubheading}>{item.price} Tokens</span> </p>
                <img src={item.image} alt={`Item ${item.item}`} className={styles.itemImage} />
                <p className={styles.itemDescription}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      );
}
