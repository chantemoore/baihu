import { useEffect } from 'react'

import { useAtomValue, useSetAtom } from 'jotai'
import { useImmerAtom } from 'jotai-immer'

import { classStudentsAtom, classDataAtom } from '@/atoms/battleAtoms.ts'

import DisciplineCard from '@/components/DisciplineCard/DisciplineCard.tsx'

export default function DisciplinePage() {
    const students = useAtomValue(classStudentsAtom)
    const [studentsData, setStudentsData] = useImmerAtom(classStudentsAtom)

    console.log('stu', students)
    console.log('stud', studentsData)
    return (
        <>
            {studentsData.map(stuObj => <DisciplineCard
                student={stuObj}
                setStudentsData={setStudentsData}
                key={stuObj.id}/>)}
        </>
    )
}