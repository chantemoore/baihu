import { useState } from "react";
import { useAtom, useAtomValue } from 'jotai'
import { useImmerAtom } from 'jotai-immer'

import {Button, Upload, Alert, message} from 'antd';
import { UploadOutlined, CheckOutlined } from '@ant-design/icons'

import { exampleDevClass, exampleClass } from '@/types/ExcelColumns.ts'
import { Class, Question } from '@/types/types.ts'


import {
    totalQuestionsAtom,
    questionsNameAtom,
    questionIndexAtom,
    tomorrowDateAtom,
    pastParticipantsAtom,
    battleAtom,
    skillSlotAtom } from '@/atoms/battleAtoms.ts'
import {classDataAtom, classDataOutdatedAtom, activeClassStudentsAtom} from '@/atoms/studentsAtoms.ts';

import { convertQuestionExcelToJson, saveClassAsExcel, importExcelAsClassData, exportBattleData } from '@/utils/ExcelTools.ts'
import { matchPlayer } from '@/utils/battleTools'

import BattleConfig from '@/../battleConfig.json'
import startGameIcon from '@/assets/icons/start_game.png'
import swordIcon from '@/assets/icons/sword.png'
import classroomIcon from '@/assets/icons/classroom.png'
import './BattleHomePage.scss'

export function BattleHomePage() {
    const [studentFile, setStudentFile] = useState<File | null>(null)
    const [questionFile, setQuestionFile] = useState<File | null>(null)
    const [totalQuestions, setTotalQuestions] = useAtom(totalQuestionsAtom)
    const [classData, setClassData] = useAtom(classDataAtom)
    const activeClassStudents = useAtomValue(activeClassStudentsAtom)
    const [questionsName, setQuestionsName] = useAtom(questionsNameAtom)
    const [, setQuestionIndex] = useAtom(questionIndexAtom)
    const tomorrowDate = useAtomValue(tomorrowDateAtom)
    const skillSlot = useAtomValue(skillSlotAtom)
    const pastParticipants = useAtomValue(pastParticipantsAtom)
    const [, setBattleData] = useImmerAtom(battleAtom)
    const classDataOutdated = useAtomValue(classDataOutdatedAtom)
    const [messageAPI, contextHolder] = message.useMessage()

    const dataNoIntegrity = (!studentFile && !classData.students.length) || (!totalQuestions.length && !questionFile)


    const successPop = (dataName: string) => {
        messageAPI.open({
            type: "success",
            content: `${dataName} Data successfully imported!`
        })
    }

    const errorPop = (error: string) => {
        messageAPI.open({
            type: 'error',
            content: `${error}`
        })
    }

    async function handleSubmitBtnClick(e: React.FormEvent) {
        e.preventDefault()
        if ((!studentFile && !classData.students.length) || (!totalQuestions.length && !questionFile)) {
            alert('Please upload data files to continue!')
        } else {
            try {
                if (studentFile) {
                    // Convert Excel files to JSON
                    const classJsonData: Class = await importExcelAsClassData(studentFile);
                    setClassData(classJsonData)
                    // set a cache to restore permanent skill quantity when downloading combat data, permanent skill change should level up with this cache
                    localStorage.setItem(BattleConfig.cacheControl.classDataAtomCacheKey, JSON.stringify(classJsonData))
                    successPop(classData.name)
                    setStudentFile(null)
                }
                if (questionFile) {
                    const questionJsonData = await convertQuestionExcelToJson(questionFile);
                    const formattedQuestionData: Question[] = questionJsonData.map((item: any) => ({
                        id: item.ID?.toString(),
                        stem: item.stem || '',
                        answer: item.answer || '',
                        type: item.type,
                        difficulty: item.difficulty
                    }));
                    setTotalQuestions(formattedQuestionData)
                    setQuestionsName(questionFile.name.split('.').slice(0, -1).join('.'))
                    successPop(questionsName)
                    setQuestionFile(null)
                }
            } catch (error) {
                errorPop(`Error processing files:${error}`)
            }
        }
    }

    function handleContinueBtnClick() {
        if (dataNoIntegrity) {
            errorPop('Please upload data files to continue!')
        } else if (classDataOutdated) {
            errorPop('Data is outdated! Please update!')
        } else if (activeClassStudents.length <= 1) {
            errorPop('Game can only be played with two or more players!')
        } else {
            setQuestionIndex(0)
            matchPlayer(activeClassStudents, pastParticipants, setBattleData)
        }
    }

    return (
        <div className={'battle-home-page'}>
            {contextHolder}
            <div className={'alert'}>
                {classDataOutdated && <Alert
                    className={'alert-card'}
                    message="Class Data Outdated Error"
                    description="Today's score missed in Class Data, please upload lastest file to continue."
                    type="error"
                    showIcon
                />}
                {dataNoIntegrity && <Alert
                    className={'alert-card'}
                    message="Missing Data Error"
                    description="Some neccessary data missed, please check and upload it."
                    type="error"
                    showIcon
                />}
            </div>
            <div className='data'>
                <div className={'file'}>
                    <div className={'file-upload'}>
                        <h3>Class: {classData.students?.length ? classData.name : 'No Data'}</h3>
                        <Upload
                            showUploadList={false}
                            onChange={(info) => {
                                setStudentFile(info.file.originFileObj || null)
                            }}
                            accept=".xlsx, .xls"
                        >
                            <Button shape="circle" icon={<UploadOutlined />}/>
                        </Upload>
                    </div>
                    <div className={'file-upload'}>
                        <h3>Questions: {questionsName ? questionsName : 'No Data'}</h3>
                        <Upload
                            showUploadList={false}
                            onChange={(info) => {
                                setQuestionFile(info.file.originFileObj || null)
                            }}
                            accept=".xlsx, .xls"
                        >
                            <Button shape="circle" icon={<UploadOutlined />}/>
                        </Upload>
                    </div>
                </div>
                {(studentFile || questionFile) && <div className='upload-confirm-btn'>
                    <Button onClick={handleSubmitBtnClick} className='upload-confirm-btn' shape='circle' icon={<CheckOutlined/>}/>
                    <p>确认</p>
                </div>
                }
            </div>
            <div className={'control-btn'}>
                <img
                    src={swordIcon}
                    alt='battle data download'
                    className={'icon'}
                    onClick={() => exportBattleData(classData, localStorage.getItem(BattleConfig.cacheControl.classDataAtomCacheKey), tomorrowDate, skillSlot)}
                />
                <img
                    src={classroomIcon}
                    alt='class data download'
                    className={'icon'}
                    onClick={() => saveClassAsExcel(BattleConfig.isDev ? exampleDevClass : exampleClass) }/>
            </div>
            <img onClick={handleContinueBtnClick} className='start-icon' src={startGameIcon} alt='start game icon'/>
        </div>
    )
}