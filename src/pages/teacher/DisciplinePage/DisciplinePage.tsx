
import { useAtomValue } from 'jotai'
import { useImmerAtom } from 'jotai-immer'

import { classStudentsAtom} from '@/atoms/studentsAtoms.ts'

import DisciplineCard from '@/components/DisciplineCard/DisciplineCard.tsx'
import './DisciplinePage.scss'

export default function DisciplinePage() {
    const students = useAtomValue(classStudentsAtom)
    const [, setStudentsData] = useImmerAtom(classStudentsAtom)

    return (
        <div className={'DisciplinePage'}>
            {[...students].sort((a, b) => {
                if (a.isPresent === b.isPresent) return 0;
                return a.isPresent ? -1 : 1
            }).map(stuObj =>
                <DisciplineCard
                student={stuObj} setStudentsData={setStudentsData} key={stuObj.id}/>)
            }
        </div>
    )
}