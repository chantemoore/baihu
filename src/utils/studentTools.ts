import { WritableDraft } from 'immer'
import { Student } from "@/types/types";

import { getMonthDay } from '@/utils/dateTools.ts'


export const increaseSkillAssetByStuID = (stuID: number,
                                         skillName: string,
                                         amount: number,
                                         setClassStudents: (fn: (draft: WritableDraft<Student[]>) => void) => void): void => {
    setClassStudents(draft => {
        const student = draft.find(s => s.id === stuID)
        if (student) {
            student.assets[skillName] += amount
        }
    })
}

export function adjustScoreByID(delta: number,
                                setClassStudents:  (fn: (draft: WritableDraft<Student[]>) => void) => void,
                                stuID: number,
                                currentDay: string = getMonthDay(new Date())) {

    setClassStudents((draft: WritableDraft<Student[]>) => {
        const student = draft.find(s => s.id === stuID)
        if(student) {
            student.dailyScore[currentDay] += delta
        }
    })
}

export function changeSkillQuantityByID(offset: number,
                                        skillName: string,
                                        setClassStudents:  (fn: (draft: WritableDraft<Student[]>) => void) => void,
                                        stuID: number) {
    let futureQuantity = -1
    setClassStudents(draft => {
        const student = draft.find(s => s.id === stuID)
        if (student) {
            const skillQuantity = student?.assets[skillName]
            futureQuantity = skillQuantity + offset
            if (futureQuantity >=0) {
                const studentIndex = draft.findIndex(stu => stu.id === stuID)
                if (studentIndex !== -1) {
                    draft[studentIndex].assets[skillName] = futureQuantity
                }
            }
        }
    })
    return futureQuantity >= 0
}