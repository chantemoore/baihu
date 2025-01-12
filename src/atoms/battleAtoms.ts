import { atom } from 'jotai'
import { produce } from 'immer'
import type { WritableDraft } from 'immer'

import { BattleAtomType } from '../types/atoms.ts'
import { Class, Course, Student } from '../types/types.ts'

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

export const classStudentsAtom = atom((get) => {
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
    readyTimeOver: false,
    answerTimeOver: false,
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
    return Object.keys(combatData.result).length === currentSpeakerID.length && isBattleOver;
})

export const isGameOverAtom = atom((get) => {
    const battleData = get(battleAtom)
    const {totalQuestions: {length}, questionIndex} = battleData
    return length <= questionIndex
})