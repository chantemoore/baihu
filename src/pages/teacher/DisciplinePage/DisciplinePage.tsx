import { useAtomValue } from 'jotai'
import { useImmerAtom } from 'jotai-immer'

import { classStudentsAtom } from '@/atoms/battleAtoms.ts'

import DisciplineCard from '@/components/DisciplineCard/DisciplineCard.tsx'

export default function DisciplinePage() {
    const students = useAtomValue(classStudentsAtom)
    const [studentsData, setStudentsData] = useImmerAtom(classStudentsAtom)

    return (
        <>
            {studentsData.map(stuObj => <DisciplineCard
                student={stuObj}
                setStudentsData={setStudentsData}
                key={stuObj.id}/>)}
        </>
    )
}