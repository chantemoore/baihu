import { atom } from 'jotai'
import { atomWithDefault } from 'jotai/utils'

import { produce } from 'immer'
import type { WritableDraft } from 'immer'

import { BattleAtomType } from '../types/atoms.ts'
import { Class, Course, Student } from '../types/types.ts'

// export const classDataAtom = atom<Class[]>([])
export const classDataAtom = atom<Class[]>([])

export const classCourseSelectedAtom  = atom<{
    selectComplete: boolean
    importComplete: boolean
    classID: Class['id'] | null
    courseID: Course['id'] | null
}>({
    selectComplete: false,
    importComplete: false,
    classID: null,
    courseID: null
})

export const availableCoursesAtom = atom((get) => {
    const classData = get(classDataAtom)
    const classCourseSelected = get(classCourseSelectedAtom)
    const selectedClass = classData.find((classObj) => classObj.id === classCourseSelected.classID)

    return selectedClass?.courses || []
})


export const classStudentsAtom = atom(
    (get) => {
    const classData = get(classDataAtom)
    const classSelected = get(classCourseSelectedAtom)
    const studentsInClass = classData.find((classObj) => classObj.id === classSelected.classID)
    return studentsInClass?.students || []
},
    (get, set, updater: (draft: WritableDraft<Student[]>) => void) => {
        const classData = get(classDataAtom)
        const classSelected = get(classCourseSelectedAtom)
        const newClassData = classData.map(classObj => {
            if (classObj.id === classSelected.classID) {
                return {...classObj, students: produce(classObj.students, updater)}
            }
            return classObj
        })
        set(classDataAtom, newClassData)
        // localStorage.setItem('classDataAsync', JSON.stringify(newClassData))

})

export const findStudentAtom = atom((get) => (stuID: number) => {
    const classData = get(classDataAtom)
    for (const classItem of classData) {
        const student = classItem.students.find((s) => s.id === stuID)
        if (student) {
            return student
        }
    }
    return {} as Student
})

export const battleAtom = atom<BattleAtomType>({
    questionIndex: -1,
    noBuzz: false,
    answerTimeCounter: 4,
    totalQuestions: [],
    currentPlayers: [],
    // main speaker is at thr head
    currentSpeakerID: [],
    pastParticipantsID: {},
    isBattleStart: false,
    isBattleOver: false,
    isDisplayAnswer: false,
    isBaseScoreAltered: false,
    combatData: {
        result: {},
        buff: {}
    }
})

export const readyTimeCounterAtom = atomWithDefault((get) => {
    const generalReadyTime = 2
    const quickResponseReadyTime = 3
    const currentQuestion = get(currentQuestionAtom)
    return currentQuestion?.type === 'QuickResponse' ? quickResponseReadyTime : generalReadyTime as number
})

export const isReadyTimeOverAtom = atom((get) => {
    const readyTimeCounter = get(readyTimeCounterAtom)
    return readyTimeCounter <= 0
})

export const isAnswerTimeOverAtom = atom((get) => {
    const battleData = get(battleAtom)
    return battleData.answerTimeCounter <= 0
})

export const currentQuestionAtom = atom((get) => {
    const battleData = get(battleAtom)
    const {questionIndex, totalQuestions} = battleData
    if (questionIndex >=0 && questionIndex <= totalQuestions.length) {
        return totalQuestions.length ? totalQuestions[questionIndex] : null
    } else {
        return null
    }
})

export const isJudgeFinishedAtom = atom((get) => {
    const battleData = get(battleAtom)
    const {combatData, isBattleOver, currentSpeakerID} = battleData
    // 1.have speaker 2.speaker number equals result length(assure everyone's mark is settled) 3.battle over
    return Object.keys(combatData.result).length === currentSpeakerID.length && isBattleOver && Boolean(currentSpeakerID.length);
})

export const isGameOverAtom = atom((get) => {
    const battleData = get(battleAtom)
    const {totalQuestions: {length}, questionIndex} = battleData
    return length <= questionIndex
})