import { useMemo } from 'react'
import { useAtomValue, useAtom } from 'jotai'
import { motion } from 'framer-motion';

import { praiseBtnClickedFamily } from '@/atoms/studentsAtoms';
import {currentDayAtom} from '@/atoms/battleAtoms'
import {classDataAtom} from '@/atoms/studentsAtoms.ts';

import emptyPaw from '@/assets/icons/paw_empty.png';
import paw from '@/assets/icons/paw.png'
import './LikeButton.scss'

const iconVariants = {
    unlikedIcon: {
        scale: 1,
        rotate: 0,
        opacity: 1
    },
    likeIcon: {
        scale: 1.2,
        rotate: 360,
        opacity: 1
    },
    exit: {
        scale: 0,
        rotate: 180,
        opacity: 0
    }
}

interface LikeButtonProps {
    btnLevel: string
    stuID: number
    onClick: () => void
    buttonLabel?: string
    unlikedIcon?: string
    likeIcon?: string
    disabled?: boolean
}

export function LikeButton({ stuID, onClick, btnLevel, likeIcon = paw, unlikedIcon = emptyPaw, disabled = false}: LikeButtonProps) {
    const currentDay = useAtomValue(currentDayAtom)
    const classData = useAtomValue(classDataAtom)
    const praiseKey = useMemo(() => ({
        day: currentDay,
        className: classData.name,
        studentID: stuID,
        btnLevel: btnLevel
    }), [currentDay, classData.name, stuID, btnLevel])

    const [isLiked, setIsLiked] = useAtom(praiseBtnClickedFamily(praiseKey))

    return (
        <div className={'like-btn'}>
            <motion.img
                src={isLiked ? likeIcon : unlikedIcon}
                alt={'like button'}
                onClick={() => {
                    if(!isLiked && !disabled) {
                        setIsLiked(true)
                        onClick()}
                }}
                initial='empty_paw'
                animate={isLiked ? likeIcon : unlikedIcon}
                variants={iconVariants}
                transition={{
                    type: "spring",
                    duration: 1,
                    bounce: 0.6
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.8 }}
                />
        </div>
    )
}