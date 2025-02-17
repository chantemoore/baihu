import { useEffect, useState } from 'react'
import { useAtomValue, useAtom } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import { useResetAtom } from 'jotai/utils'

import {Progress} from 'antd';

import { useAutoSave } from '@/hooks/useAutoSave.ts'
import { matchPlayer } from '@/utils/battleTools.ts'

import PlayerBackdrop from "../../components/PlayerBackdrop/PlayerBackdrop.tsx";
import {AirDrop} from '@/components/AirDrop/AirDrop.tsx';
import {AnimatedLuckyCard as LuckyCard} from '@/components/LuckyCard/LuckyCard.tsx';

import {
    questionIndexAtom,
    pastParticipantsAtom,
    totalQuestionsAtom,
    battleAtom,
    currentDayAtom,
    currentQuestionAtom,
    isJudgeFinishedAtom,
    readyTimeCounterAtom,
    isAnswerTimeOverAtom,
    isReadyTimeOverAtom,
    answerTimeCounterAtom,
    airdropActiveAtom,
    winnerAtom
    } from '@/atoms/battleAtoms.ts'
import { classDataAtom, classStudentsAtom, activeClassStudentsAtom, findStudentAtom } from '@/atoms/studentsAtoms.ts'

import calculateResult from '../../utils/calculateResult.ts'
import {SurpriseBox, airdropBoxes} from '@/models/Box.ts';

import './Battle.scss'


export function Battle() {
    const [battleData, setBattleData] = useImmerAtom(battleAtom)
    const resetBattleData = useResetAtom(battleAtom)
    const [questionIndex, setQuestionIndex] = useAtom(questionIndexAtom)
    const [pastParticipants, setPastParticipants] = useImmerAtom(pastParticipantsAtom)
    const [totalQuestions, setTotalQuestions] = useImmerAtom(totalQuestionsAtom)
    const [isJudgeFinished,] = useAtom(isJudgeFinishedAtom)
    const [, setClassStudents] = useImmerAtom(classStudentsAtom)
    const activeClassStudents = useAtomValue(activeClassStudentsAtom)
    const classData = useAtomValue(classDataAtom)
    const currentDay = useAtomValue(currentDayAtom)
    const findStudentByID = useAtomValue(findStudentAtom)
    const currentQuestion = useAtomValue(currentQuestionAtom)
    const isReadyTimeOver = useAtomValue(isReadyTimeOverAtom)
    const isAnswerTimeOver = useAtomValue(isAnswerTimeOverAtom)
    const [readyTimeCounter, setReadyTimeCounter] = useAtom(readyTimeCounterAtom)
    const resetReadyTime = useResetAtom(readyTimeCounterAtom)
    const [answerTimeCounter, setAnswerTimerCounter] = useAtom(answerTimeCounterAtom)
    const resetAnswerTimeCounter = useResetAtom(answerTimeCounterAtom)
    const [counter, setCounter] = useState(isReadyTimeOver ? answerTimeCounter : readyTimeCounter)
    const [isCenterBtnDisable, setIsCenterBtnDisable] = useState(false)
    const airdropActive = useAtomValue(airdropActiveAtom)
    const winner = useAtomValue(winnerAtom)


    useEffect(() => {
        const { isBattleStart, isBaseScoreAltered } = battleData
        // ready time for players to think, answering is not allowed
        if(!isReadyTimeOver && isBattleStart) {
            setIsCenterBtnDisable(true)
        } else if (isBaseScoreAltered && !isBattleStart) {
            setIsCenterBtnDisable(true)
        } else {
            setIsCenterBtnDisable(false)
        }
    }, [isReadyTimeOver, battleData.isBattleStart, battleData.isBaseScoreAltered]);

    // auto save class data per 1 minute
    useAutoSave('battle_cache', {
        class_data: classData,
        battle_data: battleData
    })

    useEffect(() => {
        setCounter(isReadyTimeOver ? answerTimeCounter : readyTimeCounter)
    }, [answerTimeCounter, isReadyTimeOver, readyTimeCounter]);


    const get1RandomNum = (range: number) => {
        if (range > 0) {
            return Math.floor(Math.random() * range)
        } else {
            return 0
        }
    }


    // set ready time counter behavior
    useEffect(() => {
        if (battleData.isBattleStart && !isReadyTimeOver) {
            const timer = setInterval(() => {
                setReadyTimeCounter(pre => pre - 1)
            }, 1000)
            if (readyTimeCounter === 0) {
                clearInterval(timer)
            }
            return () => clearInterval(timer)
        }
    }, [battleData.isBattleStart, isReadyTimeOver, readyTimeCounter, setReadyTimeCounter]);

    useEffect(() => {
        const {currentPlayers, isBattleStart, isBattleOver, currentSpeakerID} = battleData
        function drawSpeaker() {
            if (currentPlayers.length) {
                setBattleData(draft => {
                    draft.currentSpeakerID = [currentPlayers[get1RandomNum(2)].id]
                })
            }
        }
        // ready over and start to count answer time
        if (isBattleStart && isReadyTimeOver && !isBattleOver && currentQuestion && !currentSpeakerID.length) {
            drawSpeaker()
        }
    }, [battleData.currentSpeakerID, battleData.isBattleOver, currentQuestion, isReadyTimeOver, setBattleData]);

    // handle answer timer counter
    useEffect(() => {
        if (battleData.isBattleStart && isReadyTimeOver && !battleData.isBattleOver) {
            const timer = setInterval(() => {
                setAnswerTimerCounter(pre => pre - 1)
            }, 1000)
            // run out of answer time
            if (isAnswerTimeOver) {
                clearInterval(timer)
                setBattleData(draft => {
                    draft.isBattleOver = true
                })
            }
            return () => clearInterval(timer)
        }

    }, [battleData.isBattleOver, battleData.isBattleStart, isAnswerTimeOver, isReadyTimeOver, setBattleData]);

    useEffect(() => {
        if (isJudgeFinished) {
            calculateResult(setClassStudents, battleData, setBattleData, isJudgeFinished, currentQuestion, currentDay)
        }
    }, [battleData, currentDay, currentQuestion, isJudgeFinished, setBattleData, setClassStudents]);

    useEffect(() => {
        if (airdropActive && winner.length && isJudgeFinished && !battleData.airdropContent) {
            const [winnerID, luckPoint] = [winner[0].id, winner[0].luckPoint];
            const airdropBox = new SurpriseBox(airdropBoxes, 999);
            const result = airdropBox.open(winnerID, setClassStudents, 1, luckPoint);
            setBattleData(draft => {
                draft.airdropContent = result[0][0]
                draft.airdropDisplay.result = true
            })
        }
    }, [battleData.airdropContent, isJudgeFinished, airdropActive, winner, setBattleData, setClassStudents])

    useEffect(() => {
        if (isJudgeFinished && winner.length === 0 && battleData.airdropDisplay.icon) {
            setBattleData(draft => {
                draft.airdropDisplay.icon = false
            })
        }
    }, [battleData.airdropDisplay.icon, isJudgeFinished, setBattleData, winner.length]);


    function resetBattleStatus() {
        resetReadyTime()
        resetAnswerTimeCounter()
        // reset battle status
        resetBattleData()
    }

    function handleLastBtnClick() {
        // TODO something is wrong here, reset status when using last btn will crash whole program
        // resetBattleStatus()
        if (questionIndex > 0) {
            setQuestionIndex(pre => pre - 1)
        }
    }

    function handleCenterBtnClick() {
        if (battleData.isBattleStart) {
            setBattleData(pre => ({
                ...pre,
                isBattleOver: true
            }))
        } else {
            setBattleData(pre => ({
                ...pre,
                isBattleStart: true
            }))
        }
        if (battleData.isBattleOver) {
            setBattleData(pre => ({
                ...pre,
                isDisplayAnswer: !pre.isDisplayAnswer
            }))
        }
    }

    function handleNextBtnClick() {
        const { isBattleStart } = battleData
        // add players in history, ensuring everyone can join the battle
        if (questionIndex >= 0 && isBattleStart) {
            setPastParticipants(draft => {
                draft[questionIndex] = battleData.currentPlayers.map(player => player.id)
            })
        }

        // reset battle status
        resetBattleStatus()

        // match new players
        matchPlayer(activeClassStudents, pastParticipants, setBattleData)

        // increase question index
        // with safeguard in isGameOver atom, don't worry index overflow
        setQuestionIndex(pre => pre + 1)
    }

    function handleFlexAddBtnClick(quizType: 'QuickResponse' | 'General' | 'HealthPack' | 'Trial') {
        setTotalQuestions(draft => {
            draft.splice(questionIndex + 1, 0, {
                "id": Math.floor(Math.random() * 1000),
                "stem": "请听题",
                "answer": "请听讲",
                "type": quizType,
                "difficulty": "easy"
            })
        })
        handleNextBtnClick()
    }

    // if this question is done before, get the players from pastParticipants, otherwise, match new players
    let player1, player2
    if (Object.keys(pastParticipants).includes(questionIndex.toString())) {
        [player1, player2] = pastParticipants[questionIndex].map(stuID => findStudentByID(stuID))
    } else {
        [player1, player2] = battleData.currentPlayers.map(stuObj => findStudentByID(stuObj.id))
    }
    const {airdropDisplay, airdropContent} = battleData

    console.log('battleData', battleData)

    return (
        <div className="battle">
            <div className='airdrop-area'>
                {airdropDisplay.icon && airdropActive && <AirDrop isOpen={isJudgeFinished} key={questionIndex}/>}
                {airdropDisplay.result && airdropContent && <LuckyCard title={'幸运空投:'}
                                                                       id={airdropContent.id}
                                                                       rank={airdropContent.rank}
                                                                       index={0}
                                                                       onOk={() => setBattleData(draft => {
                                                                           draft.airdropDisplay.result = false
                                                                           draft.airdropDisplay.icon = false
                                                                       })}
                                                                       receiver={winner.map(w => w.name)}
                                                                       luckName={airdropContent.name}
                                                                       amount={airdropContent.amount}
                                                                       confirmActive={true}
                                                                       cover={airdropContent.img}/>}
            </div>
            <div className={`questions ${battleData.isBattleStart && 'q-display'}`}>
                <h2 className={`question ${currentQuestion?.type}`}>
                    {currentQuestion?.stem}
                    {questionIndex > -1 && battleData.isDisplayAnswer && `[答案：${currentQuestion?.answer}]`}
                </h2>
            </div>
            <div className={"counter"}>
                <p className={counter < 3 ? 'warning' : ''}>{counter}</p>
            </div>
            <div className={"player"}>
                <div className="player1">
                    {player1 && <PlayerBackdrop
                        player={player1}
                        isAhead={player1 && player2 && player1.dailyScore[currentDay] > player2.dailyScore[currentDay]}/>}
                </div>
                <div className="separator">|</div>
                <div className="player2">
                    {player2 && <PlayerBackdrop
                        player={player2}
                        isAhead={player1 && player2 && player1.dailyScore[currentDay] < player2.dailyScore[currentDay]}/>}
                </div>
            </div>
            <div className={"control-panel"}>
                <Progress
                    className={'battle-progress'}
                    trailColor={'black'}
                    strokeWidth={10}
                    strokeColor={'green'}
                    percent={Math.round((questionIndex / totalQuestions.length)  * 100)} type="circle" />
                <div className={'flexible-question-add'}>
                    <button onClick={() => handleFlexAddBtnClick('General')}>One General Quiz</button>
                    <button onClick={() => handleFlexAddBtnClick('HealthPack')}>One HealthPack Quiz</button>
                    <button onClick={() => handleFlexAddBtnClick('QuickResponse')}>One QuickResponse Quiz</button>
                    <button onClick={() => handleFlexAddBtnClick('Trial')}>One Trial Quiz</button>
                </div>
                <div className={'change-question'}>
                    <button onClick={() => setQuestionIndex(-1)}>
                        首页
                    </button>
                    <button
                        disabled={questionIndex <= 0}
                        onClick={handleLastBtnClick}
                        className={"prev"}>
                        上一题
                    </button>
                    <button
                        onClick={handleCenterBtnClick}
                        disabled={isCenterBtnDisable}
                        className={"start"}>{!battleData.isBattleStart
                        ? '开始'
                        : (!battleData.isBattleOver ? '停止计时' : (battleData.isDisplayAnswer ? '隐藏答案' : '显示答案'))}</button>
                    <button
                        onClick={handleNextBtnClick}
                        className={"next"}>
                        下一题
                    </button>
                    <button
                        onClick={() => setQuestionIndex(totalQuestions.length + 1)}>
                        结束
                    </button>
                </div>
            </div>
        </div>
    );
}