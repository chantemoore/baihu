import { motion } from 'framer-motion'

import './AirDrop.scss';
import airDropIcon from '@/assets/icons/airdrop.png';
import openAirDropIcon from '@/assets/icons/open_airdrop.png';

export function AirDrop({isOpen}: {isOpen: boolean}) {

    return (
        <motion.div
            initial={{ y: -200, opacity: 0, rotate: -15 }}
            animate={{
                x: '-50%',
                y: 'calc(100vh - 280px)',
                opacity: 1,
                rotate: 0
            }}
            exit={{
                y: -200,
                opacity: 0,
                rotate: -15,
                transition: {
                    duration: 3,
                    ease: "easeInOut"
                }
            }}
            transition={{
                type: "spring",
                duration: 6,
                bounce: 0.2
            }}
            className="airdrop-container"
        >
            <img src={isOpen ? openAirDropIcon : airDropIcon} alt='air drop icon'/>
        </motion.div>
    )
}