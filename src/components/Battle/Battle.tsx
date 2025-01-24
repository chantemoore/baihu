import { useEffect, useState } from 'react'
import { useAtomValue, useAtom } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import { useResetAtom } from 'jotai/utils'
import { useAutoSave } from '@/hooks/useAutoSave.ts'

import axios from 'axios';

import { Question, Student } from "@/types/types.ts";
import PlayerBackdrop from "../../components/PlayerBackdrop/PlayerBackdrop.tsx";
import {
    classDataAtom,
    classStudentsAtom,
    battleAtom,
    findStudentAtom,
    currentQuestionAtom,
    isJudgeFinishedAtom,
    readyTimeCounterAtom,
    isAnswerTimeOverAtom,
    isReadyTimeOverAtom,
    isUseCacheAtom} from '@/atoms/battleAtoms.ts'
import { answerTime } from '@/atoms/battleAtoms.ts'
import calculateResult from './calculateResult.ts'

import './Battle.scss'

import mockQuestions from '../../../test/questions.json'

const isBackendReady = false
const isDev = false


export function Battle() {
    const [battleData, setBattleData] = useImmerAtom(battleAtom)
    const [isJudgeFinished,] = useAtom(isJudgeFinishedAtom)
    const [classStudents, setClassStudents] = useAtom(classStudentsAtom)
    const [classData, setClassData] = useAtom(classDataAtom)
    const findStudentByID = useAtomValue(findStudentAtom)
    const currentQuestion = useAtomValue(currentQuestionAtom)
    const isReadyTimeOver = useAtomValue(isReadyTimeOverAtom)
    const isAnswerTimeOver = useAtomValue(isAnswerTimeOverAtom)
    const [readyTimeCounter, setReadyTimeCounter] = useAtom(readyTimeCounterAtom)
    const resetReadyTime = useResetAtom(readyTimeCounterAtom)
    const [counter, setCounter] = useState(isReadyTimeOver ? battleData.answerTimeCounter : readyTimeCounter)
    const [isUseCache, ] = useAtom(isUseCacheAtom)
    const [isCenterBtnDisable, setIsCenterBtnDisable] = useState(false)

    useEffect(() => {
        if(!isReadyTimeOver && battleData.isBattleStart) {
            setIsCenterBtnDisable(true)
        } else {
            setIsCenterBtnDisable(false)
        }
    }, [isReadyTimeOver, battleData.isBattleStart]);

    // auto save class data per 1 minute
    useAutoSave('battle_cache', {
        class_data: classData,
        battle_data: battleData
    })

    useEffect(() => {
        setCounter(isReadyTimeOver ? battleData.answerTimeCounter : readyTimeCounter)
    }, [battleData.answerTimeCounter, isReadyTimeOver, readyTimeCounter]);


    const get1RandomNum = (range: number) => {
        if (range > 0) {
            return Math.floor(Math.random() * range)
        } else {
            return 0
        }
    }

    // get questions data from backend
    useEffect(() => {
        if (isBackendReady) {
            axios.get('/api/questions').then(res => {
                console.log(res.data)
                setBattleData(draft => {
                    draft.totalQuestions = res.data as Question[]
                })
            })
        } else if(isDev) {
            console.log('Backend is not ready, use mock data instead!')
            setBattleData(draft => {
                draft.totalQuestions = mockQuestions as Question[]
            })
        } else {
            console.log('use import data!')
            try {
                const storedData = localStorage.getItem('questions')
                if (storedData) {
                    const parsedData = JSON.parse(storedData)
                    setBattleData(draft => {
                        draft.totalQuestions = parsedData
                    })
                } else {
                    console.warn('No class data found in localStorage')
                    setBattleData(draft => {
                        draft.totalQuestions = []
                    })
                }
            } catch (err) {
                console.error('Error reading from localStorage:', err)
                setBattleData(draft => {
                    draft.totalQuestions = []
                })
            }
        }
        }, [isUseCache, setBattleData, setClassData]);


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
        // battleData.currentPlayers, currentQuestion?.type, battleData.isBattleOver, battleData.isBattleStart, battleData.questionIndex, battleData.totalQuestions, counter, isJudgeFinished, setBattleData, currentQuestion
        // [battleData.currentPlayers, currentQuestion, battleData.isBattleOver, battleData.isBattleStart, battleData.questionIndex, battleData.totalQuestions, counter, isJudgeFinished, setBattleData, battleData.currentSpeakerID.length]
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
                setBattleData(draft => {
                    draft.answerTimeCounter -= 1
                })
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
            calculateResult(setClassStudents, battleData, setBattleData, isJudgeFinished, currentQuestion)
        }
    }, [battleData, currentQuestion, isJudgeFinished, setBattleData, setClassStudents]);


    function matchPlayer() {
        console.log('Match player...')
        const partStudents = Object.values(battleData.pastParticipantsID).flat()
        const candidates = classStudents.filter(stu => !partStudents.includes(stu.id))
        const get2Random = (range: number): Set<number> =>  {
            const indices = new Set<number>()
            if (range) {
                while (indices.size < 2) {
                    const randomIndex = get1RandomNum(range)
                    indices.add(randomIndex!)
                }
            }
            return indices
        }

        let chosenStudents: Student[] = []
        if (candidates.length === 0) {
            chosenStudents = Array.from(get2Random(classStudents.length)).map(index => classStudents[index])
        } else if (candidates.length === 1) {
            chosenStudents = [candidates[0], classStudents[get1RandomNum(classStudents.length)]]
        } else {
            chosenStudents = Array.from(get2Random(candidates.length)).map(index => candidates[index])
        }

        setBattleData(draft => {
            draft.currentPlayers = chosenStudents
            chosenStudents.forEach((stu) => {
                draft.combatData.buff[stu.id] = new Set()
            })
        })
    }

    function resetBattleStatus() {
        resetReadyTime()
        // reset battle status
        setBattleData(pre => ({
            ...pre,
            currentPlayers: [],
            currentSpeakerID: [],
            combatData: {
                result: {},
                buff: {}
            },
            answerTimeCounter: answerTime,
            isBattleStart: false,
            isBattleOver: false,
            isBaseScoreAltered: false,
            isDisplayAnswer: false
        }))}

    function handleLastBtnClick() {
        // TODO something is wrong here, reset status when using last btn will crash whole program
        // resetBattleStatus()
        if (battleData.questionIndex > 0) {
            setBattleData(draft => {
                draft.questionIndex = draft.questionIndex - 1
            })
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
        const {questionIndex, isBattleStart} = battleData
        // add players in history, ensuring everyone can join the battle
        if (questionIndex >= 0 && isBattleStart) {
            setBattleData(draft => {
                draft.pastParticipantsID[battleData.questionIndex] = draft.currentPlayers.map(player => player.id)
            })
        }

        // reset battle status
        resetBattleStatus()

        // match new players
        matchPlayer()

        // increase question index
        // with safeguard in isGameOver atom, don't worry index overflow
        setBattleData(draft => {
            draft.questionIndex += 1
        })
    }

    function handleFlexAddBtnClick(quizType: 'QuickResponse' | 'General' | 'HealthPack') {
        setBattleData(draft => {
            draft.totalQuestions.splice(draft.questionIndex + 1, 0, {
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
    if (Object.keys(battleData.pastParticipantsID).includes(battleData.questionIndex.toString())) {
        [player1, player2] = battleData.pastParticipantsID[battleData.questionIndex].map(stuID => findStudentByID(stuID))
    } else {
        // [player1, player2] = battleData.currentPlayers.map(stuID => {
        //     return classStudents.find(stuObj => stuObj.id === stuID.id)
        // })
        [player1, player2] = battleData.currentPlayers.map(stuObj => findStudentByID(stuObj.id))
    }
    console.log('battleData', battleData)

    return (
        <div className="battle">
            <div className={`questions ${battleData.isBattleStart && 'q-display'}`}>
                <h2 className={`question ${currentQuestion && (currentQuestion.type === 'QuickResponse' ? 'red'
                    : (currentQuestion.type === 'HealthPack' ? 'green' : ''))}`}>
                    {battleData.questionIndex > -1 ? currentQuestion?.stem : "等待开始"}
                    {battleData.questionIndex > -1 && battleData.isDisplayAnswer && `[答案：${currentQuestion?.answer}]`}
                </h2>
            </div>
            <div className={"counter"}>
                <p className={counter < 3 ? 'warning' : ''}>{counter}</p>
            </div>
            <div className={"player"}>
                <div className="player1">
                    {player1 && <PlayerBackdrop
                        player={player1}
                        isAhead={player1 && player2 && player1.score > player2.score}/>}
                </div>
                <div className="separator">|</div>
                <div className="player2">
                    {player2 && <PlayerBackdrop
                        player={player2}
                        isAhead={player1 && player2 && player1.score < player2.score}/>}
                </div>
            </div>
            <div className={"control-panel"}>
                <div className={'flexible-question-add'}>
                    <button onClick={() => handleFlexAddBtnClick('General')}>One General Quzz</button>
                    <button onClick={() => handleFlexAddBtnClick('HealthPack')}>One HealthPack Quzz</button>
                    <button onClick={() => handleFlexAddBtnClick('QuickResponse')}>One QuickResponse Quzz</button>
                </div>
                <div className={'change-question'}>
                    <button>
                        首页
                    </button>
                    <button
                        disabled={battleData.questionIndex <= 0}
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
                        onClick={() => {
                            setBattleData((draft) => {
                                draft.questionIndex = draft.totalQuestions.length + 1
                            })
                        }}>
                        结束
                    </button>
                </div>
            </div>
        </div>
    );
}