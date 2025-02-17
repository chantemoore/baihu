import { motion } from 'framer-motion';
import {Card} from 'antd';

import './LuckyCard.scss'

const { Meta } = Card

interface LuckyCardProps {
    receiver: string[];
    title: string;
    cover: string;
    luckName: string;
    amount: string | number;
    confirmActive?: boolean;
    onOk?: () => void;
    rank?: string;
    id: string;
}


export function LuckyCard({ receiver, title, cover, luckName, amount, confirmActive, onOk, rank }: LuckyCardProps) {
    return (
        <Card
            className={rank}
            title={<p>{receiver.join(',')}获得{title}</p>}
            cover={<img src={cover} alt='airdrop content icon'/>}
            actions={confirmActive ? [
                <button
                    key="confirm"
                    className={'confirm-btn'}
                    onClick={onOk}
                >
                    Confirm
                </button>
            ] : undefined}
        >
            <Meta
                title={luckName}
                description={amount}
            />
        </Card>
    );
}

interface AnimatedCardProps extends LuckyCardProps {
    index: number;
}


export function AnimatedLuckyCard(props: AnimatedCardProps) {
    return (
        <motion.div
            className='lucky-card-backdrop'
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            transition={{ duration: 0.5 }}
        >
            <div className='lucky-card'>
                <motion.div
                    className='lucky-card-content'
                    initial={{
                        x: `calc(-50% + ${props.index * 200}px)`,
                        y: '100vh'
                    }}
                    animate={{ y: 0 }}
                    transition={{
                        type: "spring",
                        damping: 20,
                        stiffness: 100,
                        duration: 0.8,
                        delay: props.index * 0.1
                    }}
                >
                    <LuckyCard {...props} />
                </motion.div>
            </div>
        </motion.div>
    );
}

interface LuckyCardsProps {
    cards: LuckyCardProps[];
    onConfirm?: () => void;
}

export function LuckyCards({ cards, onConfirm }: LuckyCardsProps) {
    return (
        <motion.div
            className='lucky-cards-backdrop'
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
            transition={{ duration: 0.5 }}
        >
            <div className='lucky-cards'>
                <div className='cards-container'>
                    {cards.map((card, index) => (
                        <motion.div
                            key={card.id}
                            className='card-wrapper'
                            initial={{ y: -100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{
                                type: "spring",
                                damping: 20,
                                stiffness: 100,
                                delay: index * 0.2
                            }}
                        >
                            <LuckyCard {...card} confirmActive={false} />
                        </motion.div>
                    ))}
                </div>
                <motion.button
                    className="confirm-all-btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: cards.length * 0.2 + 0.3 }}
                    onClick={onConfirm}
                >
                    Confirm All
                </motion.button>
            </div>
        </motion.div>
    );
}