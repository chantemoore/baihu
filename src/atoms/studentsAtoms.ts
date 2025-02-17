import {atom} from 'jotai';

import deepEqual from 'fast-deep-equal'
import { focusAtom } from 'jotai-optics'
import { atomWithStorage, atomFamily, selectAtom } from 'jotai/utils';

import { currentDayAtom } from '@/atoms/battleAtoms.ts'

import { Class, Student } from '../types/types.ts'
import BattleConfig from '@/../battleConfig.json'

type PraiseKey = {
    day: string
    className: string
    studentID: number
    btnLevel: string
}


export const classDataAtom = atomWithStorage<Class>(BattleConfig.cacheControl.classDataAtomKey, {
        name: '',
        students: []
    }, {
        getItem: (key: string, initialValue: Class) => {
            const stored = localStorage.getItem(key)
            return stored ? JSON.parse(stored) : initialValue
        },
        setItem: (key: string, value: Class) => {
            localStorage.setItem(key, JSON.stringify(value))
        },
        removeItem: (key: string) => {
            localStorage.removeItem(key)
        },
        subscribe: (key: string, callback: (value: Class) => void) => {
            const handler = (e: StorageEvent) => {
                if (e.key === key && e.newValue) {
                    callback(JSON.parse(e.newValue))
                }
            }
            window.addEventListener('storage', handler)
            return () => window.removeEventListener('storage', handler)
        }
    },
    {
        getOnInit: true
    }
)


export const classStudentsAtom = focusAtom(classDataAtom, (optic) => optic.prop('students'))
export const activeClassStudentsAtom = selectAtom(classStudentsAtom, students => students.filter((stu => stu.isActive && stu.isPresent)))


export const studentByIDAtom = atomFamily((studentID: number) =>
    focusAtom(classStudentsAtom, (optic) => optic.find((student) => student.id === studentID))
)

export const findStudentAtom = atom((get) => (stuID: number) => {
    const studentsData = get(classStudentsAtom)
    if (studentsData) {
        const student = studentsData.find((s) => s.id === stuID)
        return student ? student : {} as Student
    } else {
        return {} as Student
    }
})

export const praiseBtnClickedFamily = atomFamily((key: PraiseKey) => {
    return atomWithStorage(`praise_${key.day}_${key.className}_${key.studentID}_${key.btnLevel}`, false)
}, deepEqual)

export const classDataOutdatedAtom = atom((get) => {
    const classData = get(classDataAtom)
    const currentDay = get(currentDayAtom)
    return !classData?.students[0]?.dailyScore[currentDay]
})