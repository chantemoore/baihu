import { useState, useEffect } from 'react'
import { useImmerAtom } from 'jotai-immer';
import { useAtomValue } from 'jotai'

import { Student } from '../../types/types.ts';
import Skill from '../Skill/Skill.tsx';
import './PlayerBackdrop.scss';
import { battleAtom, isJudgeFinishedAtom, currentQuestionAtom } from '../../atoms/battleAtoms'

interface PlayerBackdropProps {
    player: Student
    isAhead?: boolean
}

export default function PlayerBackdrop({player, isAhead}: PlayerBackdropProps) {
    const {id, name, score, assets, skillSlot} = player;
    const [battleData, setBattleData] = useImmerAtom(battleAtom)
    const currentQuestion = useAtomValue(currentQuestionAtom)
    const isJudgeFinished = useAtomValue(isJudgeFinishedAtom)
    const [isChosen, setIsChosen] = useState(false)
    const [isChosable, setIsChosable] = useState(false)

    function handleJudgeBtnClick(isCorrect: boolean) {
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
        if (currentQuestion?.type === 'QuickResponse' && battleData.isBattleStart && !battleData.readyTimeOver) {
            setIsChosable(true)
        } else {
            setIsChosable(false)
        }

    }, [battleData.currentSpeakerID, battleData.isBattleStart, battleData.readyTimeOver, currentQuestion?.type, id]);


    function handleQuickResponseClick() {
        if (currentQuestion?.type === 'QuickResponse'  && battleData.isBattleStart && !battleData.currentSpeakerID.includes(id)) {
            setBattleData(draft => {
                draft.currentSpeakerID.push(id)
            })
        }
    }

    return (
        <div className={`player-backdrop ${isChosen && 'chosen'} ${isChosable && 'can-choose'}`} onClick={handleQuickResponseClick}>
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
            <h2 className={`${isAhead && 'advantage'}`}>{score}</h2>
            <div className={"skills-board"}>
                <div className={'permenant-skills'}>
                    {skillSlot.permanent.map((skill) => {
                        return <Skill key={skill} userID={player.id} name={skill} quantity={assets[skill as keyof typeof assets]}/>
                    })}
                </div>
                <div className={'temporary-skills'}>
                    {skillSlot.temporary.map((skill) => {
                        return <Skill key={skill} userID={player.id} name={skill} quantity={assets[skill as keyof typeof assets]}/>
                    })}
                </div>
            </div>
        </div>
    );
}