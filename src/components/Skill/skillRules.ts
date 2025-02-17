import { useAtomValue } from 'jotai'
import {WritableDraft} from 'immer'
import {useImmerAtom} from 'jotai-immer';
import { useResetAtom } from 'jotai/utils'

import {
    battleAtom,
    currentDayAtom,
    answerTimeCounterAtom,
    questionIndexAtom,
    totalQuestionsAtom
} from '@/atoms/battleAtoms.ts';
import {classStudentsAtom, activeClassStudentsAtom} from '@/atoms/studentsAtoms.ts'
import {adjustScoreByID} from '@/utils/studentTools.ts'
import { Student } from '@/types/types.ts'
import { aRandomNumber, getRandomNumberInRange, get1RandomElement, WeightedRandomPicker } from '@/utils/random-tools.ts'


export function useSkillRules() {
    const [battleData, setBattleData] = useImmerAtom(battleAtom);
    const [, setClassStudentsData] = useImmerAtom(classStudentsAtom)
    const activeClassStudents = useAtomValue(activeClassStudentsAtom)
    const [totalQuestions, setTotalQuestions] = useImmerAtom(totalQuestionsAtom)
    const currentIndex = useAtomValue(questionIndexAtom)
    const currentDay = useAtomValue(currentDayAtom)
    const resetAnswerTimeCounter = useResetAtom(answerTimeCounterAtom)

    const duckRule = () => {
        resetAnswerTimeCounter()
        setBattleData(draft => {
            draft.currentSpeakerID = Object.values(draft.currentPlayers).
            filter((stu: Student) => stu.id !== draft.currentSpeakerID[0]).map(i => i.id)
        })
    }

    const medKitRule = (userID: number,
                        setClassStudents: (fn: (draft: WritableDraft<Student[]>) => void) => void,
                        ) => {
        const medKitEffect = new WeightedRandomPicker([
            {item: aRandomNumber(10, 15), weight: 80},
            {item: aRandomNumber(15, 20), weight: 25},
            {item: aRandomNumber(18, 30), weight: 15},
            {item: 0, weight: 5}
        ])
        adjustScoreByID(medKitEffect.pick(), setClassStudents, userID, currentDay)
    }

    const grenadeRule = () => {
        // resetAnswerTimeCounter()
        // setBattleData(draft => {
        //     const mainSpeaker = draft.currentSpeakerID[0]
        //     const rivalSpeakerID = draft.currentPlayers.find((stu) => stu.id !== mainSpeaker)?.id as number
        //     draft.currentSpeakerID.push(rivalSpeakerID)
        // })
        duckRule()

        }

    const reliefTroopRule = () => {
        setBattleData((draft) => {
            const candidates = activeClassStudents.filter(stuObj => !battleData.currentPlayers
                .some(player => player.id === stuObj.id))
            draft.reliefPerson = candidates ? candidates[getRandomNumberInRange(0, candidates.length)] : null
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
                    stu.dailyScore[currentDay] -= 60
                })
            })
        })
    }

    const spinnerRule = () => {
        const sameTypeQuestionIndex = totalQuestions.reduce<number[]>((acc, question, index) => {
            if (question.type === totalQuestions[currentIndex]?.type && currentIndex < index) {
                acc.push(index)
            }
            return acc
        }, [])
        if (sameTypeQuestionIndex.length) {
            resetAnswerTimeCounter()
            setTotalQuestions(draft => {
                const temp = draft[currentIndex]
                const randomQuestionIndex = get1RandomElement<number>(sameTypeQuestionIndex)
                draft[currentIndex] = draft[randomQuestionIndex]
                draft[randomQuestionIndex] = temp
            })
        }
    }

    const doubleRule = () => {
        setBattleData(draft => {
            draft.multiplier = draft.multiplier * 2
        })
    }

    return {
        medKit: medKitRule,
        duck: duckRule,
        grenade: grenadeRule,
        nucBomb: nucBombRule,
        reliefTroop: reliefTroopRule,
        spinner: spinnerRule,
        double: doubleRule
    }
}