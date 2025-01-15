import { useState, useEffect } from 'react'
import { useAtomValue, useAtom } from 'jotai'
import { useImmerAtom } from 'jotai-immer'
import axios from 'axios';

import { Question, Student } from "@/types/types.ts";
import PlayerBackdrop from "../../components/PlayerBackdrop/PlayerBackdrop.tsx";
import {
    classStudentsAtom,
    battleAtom,
    findStudentAtom,
    currentQuestionAtom,
    isJudgeFinishedAtom } from '@/atoms/battleAtoms.ts'
import calculateResult from './calculateResult.ts'

import './Battle.scss'

import mockQuestions from '../../../test/questions.json'

const isBackendReady = false
const isDev = false

const readyTime = 1
const quickResponseReadyTime = 1


export function Battle() {
    const [battleData, setBattleData] = useImmerAtom(battleAtom)
    const [isJudgeFinished,] = useAtom(isJudgeFinishedAtom)
    const [classStudents, setClassStudents] = useAtom(classStudentsAtom)
    const findStudentByID = useAtomValue(findStudentAtom)
    const currentQuestion = useAtomValue(currentQuestionAtom)
    const counterTime = quickResponseReadyTime
    const [counter, setCounter] = useState(counterTime)


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
            console.log('Backend is not ready, use mock data instead')
            setBattleData(draft => {
                draft.totalQuestions = mockQuestions as Question[]
            })
        } else {
            console.log('use import data')
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
        }, [setBattleData]);

    // set counter behavior
    useEffect(() => {
        function drawSpeaker() {
            // const { currentPlayers } = battleData
            setBattleData(draft => {
                draft.currentSpeakerID = [battleData.currentPlayers[get1RandomNum(2)].id]
            })
        }

        if (battleData.isBattleStart) {
            const timer = setInterval(() => {
                setCounter(pre => pre - 1)
            }, 1000)

            if (counter === 0) {
                setBattleData(draft => {
                    draft.readyTimeOver = true
                })
            }

            if (counter === 0 || battleData.isBattleOver) {
                clearInterval(timer)
            }
            if (counter === 0 && !battleData.isBattleOver) {
                if (currentQuestion) {
                    if (currentQuestion.type === 'QuickResponse') {
                        if (!battleData.currentSpeakerID.length) {
                            drawSpeaker()
                        }
                    } else {
                        console.log('I run...')
                        drawSpeaker()
                    }
                }
            }

            return () => clearInterval(timer)
        }
        // battleData.currentPlayers, currentQuestion?.type, battleData.isBattleOver, battleData.isBattleStart, battleData.questionIndex, battleData.totalQuestions, counter, isJudgeFinished, setBattleData, currentQuestion
    }, [battleData.currentPlayers, currentQuestion, battleData.isBattleOver, battleData.isBattleStart, battleData.questionIndex, battleData.totalQuestions, counter, isJudgeFinished, setBattleData, battleData.currentSpeakerID.length]);

    useEffect(() => {
        if (isJudgeFinished) {
            calculateResult(setClassStudents, battleData, setBattleData, isJudgeFinished, currentQuestion)
        }
    }, [battleData, currentQuestion, isJudgeFinished, setBattleData, setClassStudents]);


    function matchPlayer() {
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
        // reset counter
        setCounter(counterTime)
        // reset battle status
        setBattleData(pre => ({
            ...pre,
            currentPlayers: [],
            currentSpeakerID: [],
            combatData: {
                result: {},
                buff: {}
            },
            readyTimeOver: false,
            answerTimeOver: false,
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
        const {questionIndex} = battleData
        // add players in history, ensuring everyone can join the battle
        if (questionIndex >= 0) {
            setBattleData(draft => {
                draft.pastParticipantsID[battleData.questionIndex] = draft.currentPlayers.map(player => player.id)
            })
        }
        resetBattleStatus()

        // match players
        matchPlayer()
        // with safeguard in isGameOver atom, don't worry index overflow
        setBattleData(draft => {
            draft.questionIndex = draft.questionIndex + 1
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
            draft.questionIndex += 1
            resetBattleStatus()
        })
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
                </h2>
                <h2 className={'answer'}>
                    {battleData.questionIndex > -1 && battleData.isDisplayAnswer && currentQuestion?.answer}
                </h2>
                <div className={"counter"}>
                    <p>{counter}</p>
                </div>
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
                <button
                    disabled={battleData.questionIndex <= 0}
                    onClick={handleLastBtnClick}
                    className={"prev"}>上一题
                </button>
                <button
                    onClick={handleCenterBtnClick}
                    className={"start"}>{!battleData.isBattleStart
                    ? '开始'
                    : (!battleData.isBattleOver ? '停止计时' : (battleData.isDisplayAnswer ? '隐藏答案' : '显示答案'))}</button>
                <button
                    onClick={handleNextBtnClick}
                    className={"next"}>下一题
                </button>
                <button
                    onClick={() => {setBattleData((draft) => {draft.questionIndex = draft.totalQuestions.length + 1})}}>
                    结束
                </button>
            </div>
        </div>
    );
}