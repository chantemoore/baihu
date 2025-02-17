import { WritableDraft } from 'immer'

import { get1RandomElement, get2RandomElement } from '@/utils/random-tools'

import { Student } from '@/types/types'
import { BattleAtomType } from '@/types/atoms'

export const matchPlayer = (
    activeClassStudents: Student[],
    pastParticipants: {[key: number]: number[]},
    setBattleData: (fn: (draft: WritableDraft<BattleAtomType>) => void) => void)=> {
    const partStudentIDs = Object.values(pastParticipants).flat()

    const candidates = activeClassStudents.filter(stu => !partStudentIDs.includes(stu.id));


    console.log('candidates', candidates)
    let chosenStudents: Student[] = []
    if (candidates.length === 0) {
        chosenStudents = get2RandomElement(activeClassStudents)
    } else if (candidates.length === 1) {
        chosenStudents = [candidates[0], get1RandomElement(activeClassStudents.filter(stu => stu.id !== candidates[0].id))]
    } else {
        chosenStudents = get2RandomElement(candidates)
    }


    setBattleData(draft => {
        draft.currentPlayers = chosenStudents
        chosenStudents.forEach((stu) => {
            draft.combatData.buff[stu.id] = new Set()
        })
    })
}