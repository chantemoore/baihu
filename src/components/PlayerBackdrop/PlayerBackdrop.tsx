import { useState, useEffect } from 'react'
import { useImmerAtom } from 'jotai-immer';
import { useAtomValue, useSetAtom } from 'jotai'

import { Student } from '@/types/types.ts';

import Skill from '../Skill/Skill.tsx';
import { Score } from '@/components/Score/Score.tsx'

import { battleAtom,
    readyTimeCounterAtom,
    currentDayAtom,
    isJudgeFinishedAtom,
    currentQuestionAtom,
    isReadyTimeOverAtom,
    questionIndexAtom,
    skillSlotAtom
} from '@/atoms/battleAtoms.ts'
import { classStudentsAtom, findStudentAtom, activeClassStudentsAtom } from '@/atoms/studentsAtoms.ts'

import { getBackgroundImage, getAvatarImage } from '@/utils/bgImageUtils.ts';
import {playAudio} from '@/utils/soundTools.ts';
import { changeSkillQuantityByID } from '@/utils/studentTools.ts'
import { useSkillRules } from '@/components/Skill/skillRules.ts'

import successSound from '@/assets/sounds/tom_laughter2.mp3'
import failSound from '@/assets/sounds/caibi_sound_shortened.mp3'
import './PlayerBackdrop.scss';


interface PlayerBackdropProps {
    player: Student
    isAhead?: boolean
}

export default function PlayerBackdrop({player, isAhead}: PlayerBackdropProps) {
    const currentDay = useAtomValue(currentDayAtom)
    const {id, username, assets, dailyScore } = player;
    const score = dailyScore[currentDay]
    const [battleData, setBattleData] = useImmerAtom(battleAtom)
    const findStudentByID = useAtomValue(findStudentAtom)
    const [classStudents, setStudentsData] = useImmerAtom(classStudentsAtom)
    const activeClassStudents = useAtomValue(activeClassStudentsAtom)
    const currentQuestion = useAtomValue(currentQuestionAtom)
    const isReadyTimeOver = useAtomValue(isReadyTimeOverAtom)
    const isJudgeFinished = useAtomValue(isJudgeFinishedAtom)
    const [isChosen, setIsChosen] = useState(false)
    const [isChosable, setIsChoosable] = useState(false)
    const [hasRelief, setHasRelief] = useState(false)
    const questionIndex = useAtomValue(questionIndexAtom)
    const skillSlot = useAtomValue(skillSlotAtom)
    const setReadyTimeCounter = useSetAtom(readyTimeCounterAtom)
    const skillRules = useSkillRules()


    useEffect(() => {
        setHasRelief(false)
    }, [questionIndex]);

    const [avatarImageUrl, setAvatarImageUrl] = useState('/images/avatar/default-avatar.jpg')
    useEffect(() => {
        const getImage = async () => {
            const url = await getAvatarImage(username)
            setAvatarImageUrl(url as string)
        }
        getImage()
    }, [username]);

    function handleJudgeBtnClick(isCorrect: boolean) {
        if (isCorrect) {
            playAudio(successSound).then()
        } else {
            playAudio(failSound).then()
        }
        setBattleData(draft => {
            draft.combatData.result[player.id] = isCorrect
        })
    }

    useEffect(() => {
        if (battleData.currentSpeakerID.includes(id)) {
            setIsChosen(true)
        } else {
            setIsChosen(false)
        }
        if (currentQuestion?.type === 'QuickResponse' && battleData.isBattleStart && !isReadyTimeOver && !isChosen) {
            setIsChoosable(true)
        } else {
            setIsChoosable(false)
        }
    }, [battleData.currentSpeakerID, battleData.isBattleStart, isReadyTimeOver, currentQuestion?.type, id, isChosen]);


    function handleQuickResponseClick() {
        if (currentQuestion?.type === 'QuickResponse' && !isReadyTimeOver && !battleData.noBuzz && battleData.isBattleStart && !battleData.currentSpeakerID.includes(id)) {
            setBattleData(draft => {
                draft.currentSpeakerID.push(id)
                draft.noBuzz = false
            })
            setReadyTimeCounter(0)
        }
    }

    function handleReshuffleBtnClick() {
        if (activeClassStudents.length > 2) {
            const idIndex = battleData.currentPlayers.findIndex(item => item.id === id)
            if (idIndex === -1) {
                alert('Error occurred')
            }
            const candidates = classStudents.filter(student =>
                !battleData.currentPlayers.some(player => player.id === student.id) && student.isActive)
            const randomIndex = Math.floor(Math.random() * candidates.length)
            setBattleData(draft => {
                draft.currentPlayers.splice(idIndex, 1, findStudentByID(candidates[randomIndex].id))
                // Object.keys(draft.combatData.buff).forEach(k => delete draft.combatData.buff[k])
                draft.combatData.buff = {}
                draft.currentPlayers.forEach((stu) => {
                    draft.combatData.buff[stu.id] = new Set()
                })
            })
        }
    }

    const doublePeriod = battleData.isBattleStart && !isReadyTimeOver && assets['double'] > 0

    function handleDoubleBtnClick() {
        changeSkillQuantityByID(-1, 'double', setStudentsData, id)
        skillRules.double()
    }

    return (
        <div className={`player-backdrop ${isChosen && 'chosen'} ${isChosable && 'can-choose'}`}
             style={{'backgroundImage': `url(${getBackgroundImage(username)})`}}
             onClick={handleQuickResponseClick}>
            <div className={"player-name"} >
                {(!isJudgeFinished && battleData.isBattleOver && battleData.currentSpeakerID.includes(player.id) || doublePeriod ) && (
                    <button
                        className={'right-btn'}
                        onClick={() => doublePeriod ?  handleDoubleBtnClick() : handleJudgeBtnClick(true)}>
                        {doublePeriod ? '加倍' : 'Correct'}
                    </button>
                )}
                {avatarImageUrl && <img className={'avatar'} src={avatarImageUrl} alt='player avatar'/>}
                <h1>{username}</h1>
                {(!isJudgeFinished && battleData.isBattleOver && battleData.currentSpeakerID.includes(player.id) || doublePeriod ) && (
                    <button
                        className={'false-btn'}
                        onClick={() => handleJudgeBtnClick(false)}>
                        {doublePeriod ? '不加倍' : 'False'}
                    </button>)}
            </div>
            {hasRelief && battleData.reliefPerson && <div className={'relief-player'}>援军：{battleData.reliefPerson.username}</div>}
            <button onClick={handleReshuffleBtnClick}>Reshuffle</button>
            <Score className={`${isAhead && 'advantage'}`} value={score}/>
            <div className={"skills-board"}>
                <div className={'permanent-skills'}>
                    {skillSlot.permanent.map((skill) => {
                        return <Skill key={skill} userID={player.id} name={skill}
                                      setHasRelief={setHasRelief}
                                      quantity={assets[skill as keyof typeof assets]}/>
                    })}
                </div>
                <div className={'temporary-skills'}>
                    {skillSlot.temporary.map((skill) => {
                        return <Skill key={skill} userID={player.id} name={skill}
                                      setHasRelief={setHasRelief}
                                      quantity={assets[skill as keyof typeof assets]}/>
                    })}
                </div>
            </div>
        </div>
    );
}