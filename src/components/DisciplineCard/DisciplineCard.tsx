import { useAtomValue } from 'jotai'
import { WritableDraft } from 'immer'
import { useNavigate } from 'react-router'
import { Checkbox, Switch } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'

import { currentDayAtom, skillSlotAtom } from '@/atoms/battleAtoms';

import { LikeButton } from '@/components/LikeButton/LikeButton.tsx';
import { SkillIcon } from '@/components/Skill/SkillIcon'
import { Score } from '@/components/Score/Score.tsx'

import { Student, BattleConfigType, PraiseLevels } from '@/types/types'
import { aRandomNumber } from '@/utils/random-tools.ts'
import {playAudio} from '@/utils/soundTools.ts';
import {adjustScoreByID} from '@/utils/studentTools.ts';

import fishStore from '@/assets/icons/fish_store.png';
import kittenBox from '@/assets/icons/kitten_box.png';
import homeworkIcon from '@/assets/icons/homework.png'
import paySound from '@/assets/sounds/addScore.mp3'
import goodSound from '@/assets/sounds/good.mp3'

import configJson from '@/../battleConfig.json';

import './DisciplineCard.scss'

interface DisciplineCardProps {
    student: Student
    setStudentsData: (fn: (draft: WritableDraft<Student[]>) => void) => void
}

type praiseRulesType = {
    [key in PraiseLevels]: () => void;
};

const BattleConfig = configJson as BattleConfigType

export default function DisciplineCard({student, setStudentsData}: DisciplineCardProps) {
    const { id, name, dailyScore, assets, isActive, isPresent } = student
    const currentDay = useAtomValue(currentDayAtom)
    const skillSlot = useAtomValue(skillSlotAtom)
    const navigate = useNavigate()

    const score = dailyScore[currentDay]
    const praiseLevel = BattleConfig.scoreConfig.praiseLevel

    const praiseRules: praiseRulesType = {
        level1: () => {
            adjustScoreByID(aRandomNumber(...praiseLevel['level1'] as [number, number]), setStudentsData, id, currentDay)

        },
        level2: () => {
            adjustScoreByID(aRandomNumber(...praiseLevel['level2'] as [number, number]), setStudentsData, id, currentDay)

        },
        level3: () => {
            adjustScoreByID(aRandomNumber(...praiseLevel['level3'] as [number, number]), setStudentsData, id, currentDay)

        },
        level4: () => {
            adjustScoreByID(aRandomNumber(...praiseLevel['level4'] as [number, number]), setStudentsData, id, currentDay)

        },
        homework: () => {
            adjustScoreByID(aRandomNumber(...praiseLevel['homework'] as [number, number]), setStudentsData, id, currentDay)

        }
    }

    return (
        <div className={'student-disc-card'}>
            <div className={'presence-panel'}>
                <Switch
                    checkedChildren={<CheckOutlined />}
                    unCheckedChildren={<CloseOutlined />}
                    checked={isPresent}
                    onClick={() => setStudentsData(draft => {
                        const student = draft.find(s => s.id === id)
                        if (student) {
                            student.isPresent = !student.isPresent
                        }
                    })}
                />
                <p className={isPresent ? 'presence' : 'absence'}>{isPresent ? '出席' : '缺席'}</p>
            </div>
            <h1 className={'name'}>{name}</h1>
            <Score value={score}/>
            <div className={'control-panel'}>
                <section className={'homework-check'}>
                    <LikeButton btnLevel={'homework'} stuID={id} onClick={() => {
                        if (isPresent) {
                            praiseRules['homework']()
                            playAudio(goodSound).then()}}}
                            unlikedIcon={homeworkIcon}/>
                </section>
                <section className={'praise'}>
                    {Object.keys(praiseRules).filter(k => k !== 'homework').map(praiseLevel =>
                        <LikeButton key={praiseLevel} disabled={!isPresent} stuID={id} btnLevel={praiseLevel} onClick={() => {
                            if (isPresent) {
                                playAudio(paySound).then()
                                praiseRules[praiseLevel as keyof typeof praiseRules]()
                            }

                    }}/>)}
                </section>
            </div>
            <div className={'skill-assets'}>
                <div className={'permanent-skills board'}>
                    {skillSlot.permanent.map((skill) => {
                        return <SkillIcon key={skill} name={skill} quantity={assets[skill]} isDisabled={false} isDisPlayZh={false}/>
                    })}
                </div>
                <div className={'temporary-skills board'}>
                    {skillSlot.temporary.map((skill) => {
                        return <SkillIcon key={skill} name={skill} quantity={assets[skill]} isDisabled={false} isDisPlayZh={false}/>
                    })}
                </div>
            </div>
            <div className={'store'}>
                <div onClick={() => navigate(`/store?consumer=${id}`)}>
                    <img src={fishStore} alt='fish store'/>
                    <p>Fish Store</p>
                </div>
                <div onClick={() => navigate(`/surprise?gambler=${id}`)}>
                    <img src={kittenBox} alt='lucky draw'/>
                    <p>Surprise Box</p>
                </div>
            </div>
            <Checkbox checked={isActive} onChange={() => {
                setStudentsData(draft => {
                    const student = draft.find(s => s.id === id)
                    if (student) {
                        student.isActive = !student.isActive
                    }
                })
            }} className={'isActive'}/>
        </div>
    )
}
