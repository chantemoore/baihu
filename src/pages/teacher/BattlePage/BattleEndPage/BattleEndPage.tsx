import { useNavigate } from 'react-router'
import { useAtomValue, useSetAtom } from 'jotai'

import { exportBattleData } from '@/utils/ExcelTools.ts'

import {
    questionIndexAtom,
    tomorrowDateAtom,
    skillSlotAtom
} from '@/atoms/battleAtoms.ts'
import {classDataAtom} from '@/atoms/studentsAtoms.ts';


import BattleConfig from '@/../battleConfig.json'

import './BattleEndPage.scss'

export function EndPage() {
    const navigate = useNavigate()
    const classData = useAtomValue(classDataAtom)
    const setQuestionIndex = useSetAtom(questionIndexAtom)
    const skillSlot = useAtomValue(skillSlotAtom)
    const tomorrowDate = useAtomValue(tomorrowDateAtom)

    const handleSubmitDataBtnClick = () => {
        exportBattleData(classData, localStorage.getItem(BattleConfig.cacheControl.classDataAtomCacheKey), tomorrowDate, skillSlot)
        // reset question index, since over button's functioning is based on question-index change
        setQuestionIndex(-1)
        navigate('/')
    }


    return (
        <>
            <div className={"end-page"}>
                <h1>Game Over!</h1>
                <div className={"choose-area"}>
                    <button onClick={handleSubmitDataBtnClick}>Submit Data</button>
                </div>
            </div>
        </>
    )
}