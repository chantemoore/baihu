import { type Dispatch, type SetStateAction } from 'react';
import { useState, useEffect } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { useImmerAtom } from 'jotai-immer'

import {battleAtom, isJudgeFinishedAtom, currentQuestionAtom, questionIndexAtom} from '@/atoms/battleAtoms.ts';
import {classStudentsAtom, findStudentAtom} from '@/atoms/studentsAtoms.ts'
import { useSkillRules } from './skillRules.ts'

import { Skills } from '@/models/Skill.ts'
import {SkillIcon} from './SkillIcon.tsx';
import { changeSkillQuantityByID } from '@/utils/studentTools.ts'
import {playAudio} from '@/utils/soundTools.ts';

import { type Skill } from '@/types/types.ts'

import './Skills.scss'
import conjureSound from '@/assets/sounds/conjureSound.mp3';



interface SkillProps {
    userID: number
    name: string
    quantity: number,
    setHasRelief: Dispatch<SetStateAction<boolean>>
}


interface BattleContext {
    stage: 'before' | 'in' | 'beforeJudge' | 'afterJudge'
    playerCount: number
    isQuickResponse: boolean
    isInjured: boolean,
    isSpeaker: boolean
}

const checkSkillAvailability = (skill: Skill, context: BattleContext): boolean => {
    const conditions = [
        { check: context.playerCount <= 2, required: skill.useTime.lessThan2 },
        { check: context.isQuickResponse, required: skill.useTime.atQuickResponse },
        { check: skill.useTime.whenInjured, required: context.isInjured && context.isSpeaker},
        { check: context.stage === 'before', required: skill.useTime.beforeBattle },
        { check: context.stage === 'in', required: skill.useTime.inBattle && context.isSpeaker },
        { check: context.stage === 'beforeJudge', required: skill.useTime.beforeJudge },
        { check: context.stage === 'afterJudge', required: skill.useTime.afterJudge }
    ];


    return conditions
        .filter(({ check }) => check)
        .every(({ required }) => required);
}


export default function Skill({userID, name, quantity, setHasRelief}: SkillProps) {
    const [battleData, setBattleData] = useImmerAtom(battleAtom)
    const isJudgeFinished = useAtomValue(isJudgeFinishedAtom)
    const [classStudentsData, setStudentsData] = useImmerAtom(classStudentsAtom)
    const [isDisabled, setIsDisabled] = useState(true)
    const [isUsed, setIsUsed] = useState(false)
    const currentQuestion = useAtomValue(currentQuestionAtom)
    const [questionIndex, ] = useAtom(questionIndexAtom)
    const skillRules = useSkillRules()

    const { useTime }  = Skills[name]


    // clear skill isUsed state when question change
    useEffect(() => {
        setIsUsed(false)
    }, [questionIndex]);

    useEffect(() => {
        // skills of no stock or used in the round are banned.
        if (quantity === 0 || isUsed || currentQuestion?.type === 'Trial')  {
            setIsDisabled(true)
        } else {
            if (!battleData.isBattleStart) {
                setIsDisabled(!checkSkillAvailability(Skills[name], {
                    playerCount: classStudentsData.filter(stu => stu.isActive).length,
                    isInjured: isJudgeFinished && !battleData.combatData.result[userID],
                    isQuickResponse: currentQuestion?.type === 'QuickResponse',
                    isSpeaker: battleData.currentSpeakerID.includes(userID),
                    stage: 'before'
                }))
            } else if (battleData.isBattleStart && !battleData.isBattleOver) {
                setIsDisabled(!checkSkillAvailability(Skills[name], {
                    playerCount: classStudentsData.filter(stu => stu.isActive).length,
                    isInjured: isJudgeFinished && !battleData.combatData.result[userID],
                    isQuickResponse: currentQuestion?.type === 'QuickResponse',
                    isSpeaker: battleData.currentSpeakerID.includes(userID),
                    stage: 'in'
                }))
            } else if (battleData.isBattleOver && !isJudgeFinished) {
                setIsDisabled(!checkSkillAvailability(Skills[name], {
                    playerCount: classStudentsData.filter(stu => stu.isActive).length,
                    isInjured: isJudgeFinished && !battleData.combatData.result[userID],
                    isQuickResponse: currentQuestion?.type === 'QuickResponse',
                    isSpeaker: battleData.currentSpeakerID.includes(userID),
                    stage: 'beforeJudge'
                }))
            } else if (isJudgeFinished) {
                setIsDisabled(!checkSkillAvailability(Skills[name], {
                    playerCount: classStudentsData.filter(stu => stu.isActive).length,
                    isInjured: isJudgeFinished && !battleData.combatData.result[userID],
                    isQuickResponse: currentQuestion?.type === 'QuickResponse',
                    isSpeaker: battleData.currentSpeakerID.includes(userID),
                    stage: 'afterJudge'
                }))
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

    }, [battleData.combatData.buff, battleData.combatData.result, battleData.currentPlayers, battleData.currentSpeakerID, battleData.isBattleOver, battleData.isBattleStart, classStudentsData.length, currentQuestion?.type, isJudgeFinished, isUsed, name, quantity, useTime.afterJudge, useTime.atQuickResponse, useTime.beforeBattle, useTime.beforeJudge, useTime.inBattle, useTime.lessThan2, useTime.whenInjured, userID]);

    // handle skills' usage
    function handleSkillIconClick() {

        // make sure one skill can just be used only once in one round
        // change skill quantity
        if (!isDisabled) {
            // play sound
            playAudio(conjureSound).then()
            let changeResult: boolean
            if (Object.values(battleData.combatData.buff).some(buffset => buffset.has('duck')) && name === 'duck') {
                changeResult = changeSkillQuantityByID(-2, name, setStudentsData, userID)
            } else {
                changeResult = changeSkillQuantityByID(-1, name, setStudentsData, userID)
            }
            if (changeResult) {
                setIsUsed(true)
                setBattleData(draft => {
                    draft.combatData.buff[userID].add(name)
                })

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
                if (name === 'reliefTroop') {
                    skillRules.reliefTroop()
                    setHasRelief(true)
                }
                if (name === 'spinner') {
                    skillRules.spinner()
                }
                if (name === 'double') {
                    skillRules.double()
                }
            }
        } // NO code after this closed curly bracket!
    }

    return (
        <SkillIcon name={name} onClick={handleSkillIconClick} isDisPlayZh={true} isDisabled={isDisabled} quantity={quantity}/>
    )
}