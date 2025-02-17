import { useState } from 'react'
import {useAtom} from 'jotai';
import {useImmerAtom} from 'jotai-immer';
import {useSearchParams, useNavigate} from 'react-router';

import { studentByIDAtom, classStudentsAtom } from '@/atoms/studentsAtoms'
import { LuckyCards } from '@/components/LuckyCard/LuckyCard.tsx'
import { SurpriseBox, surpriseBoxes} from '@/models/Box.ts'

import {BoxItem} from '@/types/box.ts';

import './SurpriseBoxPage.scss'


export default function SurpriseBoxPage() {
    const [, setClassStudents] = useImmerAtom(classStudentsAtom)
    const [searchParams] = useSearchParams();
    const navigate = useNavigate()
    const gamblerID = Number(searchParams.get('gambler'))
    const [gambler,] = useAtom(studentByIDAtom(gamblerID))
    const [openResults, setOpenResults] = useState<BoxItem[]>([])


    function handleOpenBtnClick(openCount: number) {
        if (gambler) {
            const [openerID, luckPoint] = [gamblerID, gambler.luckPoint];
            const surpriseBox = new SurpriseBox(surpriseBoxes, 10);
            const result = surpriseBox.open(openerID, setClassStudents, openCount, luckPoint);
            setOpenResults(result[0])
        }
    }

    function handleConfirmBtnClick() {
        setOpenResults([])
        navigate(-1)
    }

    const cardProps = openResults.map(re => ({
        id: re.id,
        receiver: [gambler?.name || '???'],
        title: '幸运盲盒',
        rank: re.rank,
        cover: re.img,
        luckName: re.name,
        amount: re.amount,
        confirmActive: false,
        onOk: () => {}
    }))
    console.log('results', openResults)



    return (
        <div className={'surprise-box'}>
            <div className={'header'}>
                {gambler && `欢迎你，${gambler.name}!`}
            </div>
            <div className='display'>
                {/*{openResults.length > 0 && cardProps.map((card, index) => <LuckyCard key={card.id} {...card} index={index}/>)}*/}
                {openResults.length > 0 && <LuckyCards cards={cardProps} onConfirm={handleConfirmBtnClick}/>}
            </div>
            <div className={'draw'}>
                <button onClick={() => handleOpenBtnClick(2)}>抽2次</button>
                <button onClick={() => handleOpenBtnClick(5)}>抽5次</button>
            </div>
        </div>
    )
}