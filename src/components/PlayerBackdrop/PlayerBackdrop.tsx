import { useState, useEffect } from 'react'
import { useImmerAtom } from 'jotai-immer';
import { useAtomValue } from 'jotai'

import { Student } from '@/types/types.ts';
import Skill from '../Skill/Skill.tsx';
import './PlayerBackdrop.scss';
import { battleAtom,
    isJudgeFinishedAtom,
    currentQuestionAtom,
    findStudentAtom,
    classStudentsAtom,
    isReadyTimeOverAtom
} from '@/atoms/battleAtoms.ts'

import { getBackgroundImage, getAvatarImage } from '@/utils/bgImageUtils.ts';

import successSound from '@/assets/sounds/kinghonor_kill_sound.mp3'
import failSound from '@/assets/sounds/caibi_sound_shortened.mp3'


const playAudio = (audioObj: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const audio = new Audio(audioObj);

        audio.onended = () => resolve();
        audio.onerror = (error) => reject(error);

        audio.play()
            .catch(error => {
                console.error('Audio playback failed:', error);
                reject(error);
            });
    });
};

interface PlayerBackdropProps {
    player: Student
    isAhead?: boolean
}

export default function PlayerBackdrop({player, isAhead}: PlayerBackdropProps) {
    const {id, username, score, assets, skillSlot} = player;
    const [battleData, setBattleData] = useImmerAtom(battleAtom)
    const findStudentByID = useAtomValue(findStudentAtom)
    const classStudents = useAtomValue(classStudentsAtom)
    const currentQuestion = useAtomValue(currentQuestionAtom)
    const isReadyTimeOver = useAtomValue(isReadyTimeOverAtom)
    const isJudgeFinished = useAtomValue(isJudgeFinishedAtom)
    const [isChosen, setIsChosen] = useState(false)
    const [isChosable, setisChosable] = useState(false)
    const [hasRelief, setHasRelief] = useState(false)
    useEffect(() => {
        setHasRelief(false)
    }, [battleData.questionIndex]);

    // const avatarImageUrl =  getAvatarImage(username)
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
            playAudio(successSound)
        } else {
            playAudio(failSound)
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
            setisChosable(true)
        } else {
            setisChosable(false)
        }
    }, [battleData.currentSpeakerID, battleData.isBattleStart, isReadyTimeOver, currentQuestion?.type, id, isChosen]);


    function handleQuickResponseClick() {
        if (currentQuestion?.type === 'QuickResponse'  && battleData.isBattleStart && !battleData.currentSpeakerID.includes(id)) {
            setBattleData(draft => {
                draft.currentSpeakerID.push(id)
            })
        }
    }

    function handleReshuffleBtnClick() {
        const idIndex = battleData.currentPlayers.findIndex(item => item.id === id)
        if (idIndex === -1) {
            alert('Error occurred')
        }
        const candidates = classStudents.filter(student =>
            !battleData.currentPlayers.some(player => player.id ===student.id))
        const randomIndex = Math.floor(Math.random() * candidates.length)
        setBattleData(draft => {
            draft.currentPlayers.splice(idIndex, 1, findStudentByID(candidates[randomIndex].id))
            Object.keys(draft.combatData.buff).forEach(k => delete draft.combatData.buff[k])
            draft.currentPlayers.forEach((stu) => {
                draft.combatData.buff[stu.id] = new Set()
            })
        })
    }
    return (
        <div className={`player-backdrop ${isChosen && 'chosen'} ${isChosable && 'can-choose'}`}
             style={{'backgroundImage': `url(${getBackgroundImage(username)})`}}
             onClick={handleQuickResponseClick}>
            <div className={"player-name"} >
                {!isJudgeFinished && battleData.isBattleOver && battleData.currentSpeakerID.includes(player.id) && (
                    <button
                        className={'right-btn'}
                        onClick={() => handleJudgeBtnClick(true)}>
                        Correct
                    </button>
                )}
                {avatarImageUrl && <img className={'avatar'} src={avatarImageUrl}/>}
                <h1>{username}</h1>
                {!isJudgeFinished && battleData.isBattleOver && battleData.currentSpeakerID.includes(player.id) && (
                    <button
                        className={'false-btn'}
                        onClick={() => handleJudgeBtnClick(false)}>
                        False
                    </button>)}
            </div>
            {hasRelief && battleData.reliefPerson && <div className={'relief-player'}>援军：{battleData.reliefPerson.username}</div>}
            <button onClick={handleReshuffleBtnClick}>Reshuffle</button>
            <h2 className={`${isAhead && 'advantage'}`}>{score}</h2>
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