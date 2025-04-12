import { useState } from "react";
import { projects } from "../../constants";
import { FaArrowRight, FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import styles from "../../styles/project.module.css";

const ImageSlider = () => {

    const [current, setCurrent] = useState(0);
    const animals = ['/dog.gif', '/cat.gif', '/owl.gif', '/capybara.gif', '/quokka.gif' ]
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

    return (
        // <div className="slider_container">
        //     <FaArrowLeft className={styles.leftArrow} onClick={prevSlide} />
        //     <img src={images[current]} alt="Pet" className="slider-img" />

        //     <img src={images[current]} alt="Pet" className="slider-img" />

        //     <FaArrowRight className={styles.rightArrow} onClick={nextSlide} /> 
        // </div>
  
        // <div className={styles.sliderContainer}>            
        //     <div className={styles.projectBox}>
        //         <div className={styles.slider}>
        //             {projects.map((project, index) => (  
        //                 <div key={index} className={`${styles.slide} ${index === current ? styles.active : ''}`}

        //                   >
        //                     {index === current && (
        //                     <div className={styles.imageWrapper}>
        //                         <img src={`${project.path}`} alt={project.title} className={styles.image}/>
        //                             {project.link && (
        //                                 <a href={project.link} target="_blank" rel="noreferrer" className={styles.code}>
        //                                     <FaExternalLinkAlt size="1.5rem" />
        //                                 </a>
        //                             )}
        //                     </div>          
        //                     )}
        //                 </div>
        //             ))}
        //         </div>
        //     </div>
        // </div>
    );
};


export default ImageSlider;