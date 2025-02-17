import { useAtomValue } from 'jotai'

import {
    isGameOverAtom,
    questionIndexAtom,
    } from '@/atoms/battleAtoms.ts'

import { Battle } from "@/components/Battle/Battle.tsx";
import { BattleHomePage } from '@/pages/teacher/BattlePage/BattleHomePage/BattleHomePage.tsx'
import { EndPage } from '@/pages/teacher/BattlePage/BattleEndPage/BattleEndPage.tsx'


import './BattlePage.scss'



export default function BattlePage() {
    const isGameOver = useAtomValue(isGameOverAtom)
    const questionIndex = useAtomValue(questionIndexAtom)
    if (questionIndex >= 0) {
        return (
            <>
                {!isGameOver ? <Battle/> : <EndPage/>}
            </>
        )
    } else {
        return <BattleHomePage />
    }

}