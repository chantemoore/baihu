import { WritableDraft } from 'immer'
import {useImmerAtom} from 'jotai-immer';

import { battleAtom, classStudentsAtom } from '../../atoms/battleAtoms.ts';
import { adjustScore } from '../Battle/calculateResult.ts'
import { Student } from '../../types/types.ts'

interface skillScoreRulesType {
    [key: string]: (...args: any[]) => void;
}

export function useSkillRules() {
    const [, setBattleData] = useImmerAtom(battleAtom);
    const [, setClassStudentsData] = useImmerAtom(classStudentsAtom)

    const duckRule = () => {
        console.log('use duck!')
        setBattleData(draft => {
            draft.currentSpeakerID = Object.values(draft.currentPlayers).
            filter((stu: Student) => stu.id !== draft.currentSpeakerID[0]).map(i => i.id)
        })
    }

    const medKitRule = (userID: number,
                        setClassStudents: (fn: (draft: WritableDraft<Student[]>) => void) => void) => {
        adjustScore(10, setClassStudents, userID)
    }

    const grenadeRule = () => {
        setBattleData(draft => {
            const mainSpeaker = draft.currentSpeakerID[0]
            const rivalSpeakerID = draft.currentPlayers.find((stu) => stu.id !== mainSpeaker)?.id as number
            draft.currentSpeakerID.push(rivalSpeakerID)
        })
        }

    const nucBombRule = () =>  {
        setBattleData(draft => {
            draft.isBattleOver = true
            draft.isBaseScoreAltered = true
            draft.currentSpeakerID.forEach((playerID) => {
                draft.combatData.result[playerID] = true
            })
            setClassStudentsData(draft => {
                draft.forEach(stu => {
                    stu.score -= 60
                })
            })
        })
    }

    const skillScoreRules: skillScoreRulesType = {
        medKit: medKitRule,
        duck: duckRule,
        grenade: grenadeRule,
        nucBomb: nucBombRule
    }

    return skillScoreRules
}