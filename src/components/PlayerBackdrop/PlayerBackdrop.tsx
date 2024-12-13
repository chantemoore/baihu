import { useImmerAtom } from 'jotai-immer';
import { useAtomValue } from 'jotai'

import { Student } from '../../types/types.ts';
import Skill from '../Skill/Skill.tsx';
import './PlayerBackdrop.scss';
import { battleAtom, isJudgeFinishedAtom } from '../../atoms/battleAtoms'

interface PlayerBackdropProps {
    player: Student
    isAhead?: boolean
    isChosen?: boolean
}

export default function PlayerBackdrop({player, isAhead, isChosen}: PlayerBackdropProps) {
    const {name, score, assets, skillSlot} = player;
    const [battleData, setBattleData] = useImmerAtom(battleAtom)
    const isJudgeFinished = useAtomValue(isJudgeFinishedAtom)

    function handleJudgeBtnClick(isCorrect: boolean) {
        setBattleData(draft => {
            draft.combatData.result[player.id] = isCorrect
        })

    }

    return (
        <div className={`player-backdrop ${isChosen && 'chosen'}`}>
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