import { useState, useEffect } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { useImmerAtom } from 'jotai-immer'

import { battleAtom, classStudentsAtom, findStudentAtom, isJudgeFinishedAtom } from '@/atoms/battleAtoms.ts'
import { useSkillRules } from './skillRules.ts'
import skillDict from '../../data/skills.json';

import './Skills.scss'



interface SkillProps {
    userID: number
    name: string
    quantity: number
}

interface skills {
    [key: string] : {
        zh_name: string
        useTime: {
            [key: string]: boolean
        }
    }
}

const skillIcons: {[key: string]: string} = {
    duck: 'src/assets/icons/run.svg',
    grenade: 'src/assets/icons/grenade.svg',
    nucBomb: 'src/assets/icons/nucBomb.png',
    medKit: 'src/assets/icons/medKit.png',
    goldBell: 'src/assets/icons/bell.svg'
}


export default function Skill({userID, name, quantity}: SkillProps) {
    const ImgUrl = skillIcons[name]
    const [battleData, setBattleData] = useImmerAtom(battleAtom)
    const isJudgeFinished = useAtomValue(isJudgeFinishedAtom)
    const [, setStudentsData] = useImmerAtom(classStudentsAtom)
    const [findStudentByID] = useAtom(findStudentAtom)
    const [isDisabled, setIsDisabled] = useState(true)
    const [isUsed, setIsUsed] = useState(false)
    const Skills: skills = skillDict
    const {zh_name, useTime}  = Skills[name]

    const skillRules = useSkillRules()


    useEffect(() => {
        // skills of no stock or used in the round are banned.
        if (quantity === 0 || isUsed)  {
            console.log('No account! or is used once')
            setIsDisabled(true)
        } else {
            if(battleData.currentSpeakerID.includes(userID)) {
                if(!battleData.isBattleStart) {
                    setIsDisabled(!useTime.beforeBattle)
                } else if(battleData.isBattleStart && !battleData.isBattleOver) {
                    setIsDisabled(!useTime.inBattle)
                } else if(battleData.isBattleOver && !isJudgeFinished) {
                    setIsDisabled(!useTime.beforeJudge)
                } else if(battleData.isBattleOver && isJudgeFinished) {
                    setIsDisabled(!useTime.afterJudge)
                } else {
                    setIsDisabled(true)
                }
            }
            if(isJudgeFinished && battleData.combatData.result?.[userID] === false) {
                setIsDisabled(!useTime.whenInjured)
            }

        }

        // make sure no using of skills of similar effects per user
        const similarSkills = ['duck', 'grenade']
        const otherConflictSkills = similarSkills.filter(s => s !== name)
        if (similarSkills.includes(name) && otherConflictSkills.some(skill => {
            return Object.values(battleData.combatData.buff).some(buff => {
                return buff.has(skill)
            })

        })) {
            console.log('disable some similar skills...')
            setIsDisabled(true)
        }

        // make sure some special skills could just be used once in a round
        const single1RoundSkills = ['grenade']
        const rivalPlayerID = battleData.currentPlayers.find(player => player.id !== userID)?.id as number
        if (single1RoundSkills.includes(name) && battleData.combatData.buff[rivalPlayerID].has(name)) {
            setIsDisabled(true)
        }

    }, [battleData.combatData.buff, battleData.combatData.result, battleData.currentPlayers, battleData.currentSpeakerID, battleData.isBattleOver, battleData.isBattleStart, isJudgeFinished, isUsed, name, quantity, useTime.afterJudge, useTime.beforeBattle, useTime.beforeJudge, useTime.inBattle, useTime.whenInjured, userID]);

    // handle skills' usage
    function handleSkillIconClick() {
        const skillQuantity = findStudentByID(userID)?.assets[name]
        let futureQuantity: number

        function changeSkillQuantity(offset: number) {
            futureQuantity = skillQuantity + offset
            if (futureQuantity >=0) {
                setStudentsData(draft => {
                    const studentIndex = draft.findIndex(stu => stu.id === userID)
                    if (studentIndex !== -1) {
                        draft[studentIndex].assets[name] = futureQuantity
                    }
                })
            }
            return futureQuantity >= 0
        }

        // make sure one skill can just be used only once in one round
        // change skill quantity
        if (!isDisabled) {
            let changeResult: boolean
            if (Object.values(battleData.combatData.buff).some(buffset => buffset.has('duck')) && name === 'duck') {
                changeResult = changeSkillQuantity(-2)
            } else {
                changeResult = changeSkillQuantity(-1)
            }
            if (changeResult) {
                setIsUsed(true)
                setBattleData(draft => {
                    draft.combatData.buff[userID].add(name)
                })
                setIsDisabled(true)

                // add skill using history in buff pool

                // apply skill effects
                if (name === 'duck') {
                    skillRules.duck()
                }
                if (name === 'medKit') {
                    skillRules.medKit(userID, setStudentsData)
                }
                if (name === 'grenade') {
                    skillRules.grenade()
                }
                if (name === 'nucBomb') {
                    skillRules.nucBomb()
                }
            }
        } // NO code after this closed curly bracket!
    }

    return (
        <div className={"skill"}>
            <p className={"skill-name"}>{zh_name}</p>
            <img
                onClick={handleSkillIconClick}
                className={`icon ${isDisabled && 'disabled'}`} src={ImgUrl} alt={`${name} icon`}/>
            <p>{quantity}</p>
        </div>
    )
}