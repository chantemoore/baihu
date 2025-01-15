import { useState, useEffect } from 'react'
import { useImmerAtom } from 'jotai-immer';
import { useAtomValue } from 'jotai'

import { Student } from '@/types/types.ts';
import Skill from '../Skill/Skill.tsx';
import './PlayerBackdrop.scss';
import { battleAtom, isJudgeFinishedAtom, currentQuestionAtom, findStudentAtom, classStudentsAtom } from '@/atoms/battleAtoms.ts'

import successSound from '@/assets/sounds/kinghonor_kill_sound.mp3'
import failSound from '@/assets/sounds/caibi_sound.mp3'


const playAudio = (audioObj: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const audio = new Audio(audioObj);

        audio.onended = () => resolve();
        audio.onerror = (error) => reject(error);

        audio.play()
            .catch(error => {
                console.error('Audio playback failed:', error);
                reject(error);
            });
    });
};

interface PlayerBackdropProps {
    player: Student
    isAhead?: boolean
}

export default function PlayerBackdrop({player, isAhead}: PlayerBackdropProps) {
    const {id, name, score, assets, skillSlot} = player;
    const [battleData, setBattleData] = useImmerAtom(battleAtom)
    const findStudentByID = useAtomValue(findStudentAtom)
    const classStudents = useAtomValue(classStudentsAtom)
    const currentQuestion = useAtomValue(currentQuestionAtom)
    const isJudgeFinished = useAtomValue(isJudgeFinishedAtom)
    const [isChosen, setIsChosen] = useState(false)
    const [isChosable, setisChosable] = useState(false)

    function handleJudgeBtnClick(isCorrect: boolean) {
        if (isCorrect) {
            playAudio(successSound)
        } else {
            playAudio(failSound)
        }
        setBattleData(draft => {
            draft.combatData.result[player.id] = isCorrect
        })
    }

    useEffect(() => {
        if (battleData.currentSpeakerID.includes(id)) {
            setIsChosen(true)
        } else {
            setIsChosen(false)
        }
        if (currentQuestion?.type === 'QuickResponse' && battleData.isBattleStart && !battleData.readyTimeOver && !isChosen) {
            setisChosable(true)
        } else {
            setisChosable(false)
        }
    }, [battleData.currentSpeakerID, battleData.isBattleStart, battleData.readyTimeOver, currentQuestion?.type, id, isChosen]);


    function handleQuickResponseClick() {
        if (currentQuestion?.type === 'QuickResponse'  && battleData.isBattleStart && !battleData.currentSpeakerID.includes(id)) {
            setBattleData(draft => {
                draft.currentSpeakerID.push(id)
            })
        }
    }

    function handleReshuffleBtnClick() {
        const idIndex = battleData.currentPlayers.findIndex(item => item.id === id)
        if (idIndex === -1) {
            alert('Error occurred')
        }
        const candidates = classStudents.filter(student =>
            !battleData.currentPlayers.some(player => player.id ===student.id))
        const randomIndex = Math.floor(Math.random() * candidates.length)
        setBattleData(draft => {
            draft.currentPlayers.splice(idIndex, 1, findStudentByID(candidates[randomIndex].id))
            Object.keys(draft.combatData.buff).forEach(k => delete draft.combatData.buff[k])
            draft.currentPlayers.forEach((stu) => {
                draft.combatData.buff[stu.id] = new Set()
            })
        })
    }

    return (
        <div className={`player-backdrop ${isChosen && 'chosen'} ${isChosable && 'can-choose'}`}
             onClick={handleQuickResponseClick}>
            <div className={"player-name"}>
                {!isJudgeFinished && battleData.isBattleOver && battleData.currentSpeakerID.includes(player.id) && (
                    <button
                        onClick={() => handleJudgeBtnClick(true)}>
                        Correct
                    </button>
                )}
                <h1>{name}</h1>
                {!isJudgeFinished && battleData.isBattleOver && battleData.currentSpeakerID.includes(player.id) && (
                    <button
                        onClick={() => handleJudgeBtnClick(false)}>
                        False
                    </button>)}
            </div>
            <button onClick={handleReshuffleBtnClick}>Reshuffle</button>
            <h2 className={`${isAhead && 'advantage'}`}>{score}</h2>
            <div className={"skills-board"}>
                <div className={'permanent-skills'}>
                    {skillSlot.permanent.map((skill) => {
                        return <Skill key={skill} userID={player.id} name={skill}
                                      quantity={assets[skill as keyof typeof assets]}/>
                    })}
                </div>
                <div className={'temporary-skills'}>
                    {skillSlot.temporary.map((skill) => {
                        return <Skill key={skill} userID={player.id} name={skill}
                                      quantity={assets[skill as keyof typeof assets]}/>
                    })}
                </div>
            </div>
        </div>
    );
}