import { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router'
import axios from 'axios';
import { useAtom, useAtomValue } from 'jotai'
import { useImmerAtom } from 'jotai-immer'

import * as XLSX from 'xlsx'

import { Battle } from "@/components/Battle/Battle.tsx";
import { downloadAsExcel } from '@/utils/downloadAsExcel'
import { ClassImportDataType } from '@/types/types.ts'

import { classCourseSelectedAtom,
    classStudentsAtom,
    classDataAtom,
    availableCoursesAtom,
    battleAtom,
    isGameOverAtom,
    isUseCacheAtom} from '@/atoms/battleAtoms.ts'

import './BattlePage.scss'
import mockClass from '../../../../test/classes.json'
import chooseFileIcon from '@/assets/icons/choose_file.svg'
import { Question, Student} from "@/types/types.ts";
import { battleCacheType } from '@/types/utils'

const isBackendReady = false
const isDev = false


function ImportClassCoursePage() {
    const [studentFile, setStudentFile] = useState<File | null>(null)
    const [questionFile, setQuestionFile] = useState<File | null>(null)
    const [, setClassCourseSelected] = useImmerAtom(classCourseSelectedAtom)
    const [, setIsUseCache] = useAtom(isUseCacheAtom)


    const convertExcelToJson = async (file: File): Promise<ClassImportDataType[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (event) => {
                try {
                    const data = event.target?.result
                    const workBook = XLSX.read(data, {type: "binary"})
                    const sheetName = workBook.SheetNames[0]
                    const worksheet = workBook.Sheets[sheetName]
                    const jsonData = XLSX.utils.sheet_to_json(worksheet)
                    resolve(jsonData)
                } catch (err) {
                    reject(err)
                }
            }
            reader.onerror = (err) => reject(err)
            // reader.readAsBinaryString(file);
            reader.readAsArrayBuffer(file)
        })

    }

    async function handleSubmitBtnClick(e: React.FormEvent) {
        e.preventDefault()
        if (!studentFile || !questionFile) {
            alert('Please upload both files!')
        } else {
            try {
                // Convert both Excel files to JSON
                const classJsonData: ClassImportDataType[] = await convertExcelToJson(studentFile);
                const questionJsonData = await convertExcelToJson(questionFile);

                // Transform to required structure
                const formattedClassData: Student[] = classJsonData
                    .filter(item => item.isActive)
                    .map((item) => ({
                    id: item.id?.toString(),
                    name: item.name,
                    username: item.username || '',
                    fish: item.fish,
                    score: Number(item.score),
                    assets: {
                        duck: item.duck,
                        grenade: item.grenade,
                        nucBomb: item.nucBomb,
                        reliefTroop: item.reliefTroop,
                        medKit: item.medKit,
                        goldBell: item.goldBell
                    },
                    skillSlot: {
                        "permanent": ["duck", "goldBell", "reliefTroop"],
                        "temporary": ["medKit", "nucBomb", "grenade"]
                    },
                })
                );

                const formattedQuestionData: Question[] = questionJsonData.map((item: any) => ({
                    id: item.ID?.toString(),
                    stem: item.stem || '',
                    answer: item.answer || '',
                    type: item.type,
                    difficulty: item.difficulty
                }));

                const permanentSkillAssetsData: {
                    [key: number]: {[key: string]: number}
                } = {}
                classJsonData.forEach((item) => {
                    permanentSkillAssetsData[item.id] = {
                        duck: item.duck,
                        reliefTroop: item.reliefTroop,
                        goldBell: item.goldBell
                    }
                })

                // Store classJson in localStorage
                localStorage.setItem('class', JSON.stringify([{
                    id: Math.floor(Math.random() * 100),
                    name: 'current',
                    students: formattedClassData
                }]));
                // store permanent skill assets
                localStorage.setItem('permanentSkillAssets', JSON.stringify(permanentSkillAssetsData))
                // store question data
                localStorage.setItem('questions', JSON.stringify(formattedQuestionData));

                console.log('Data imported successfully!');

                // complete data import
                setClassCourseSelected(draft => {
                    draft.importComplete = true
                })
            } catch (error) {
                console.error('Error processing files:', error);
            }
        }
    }

    function handleContinueBtn() {
        const cache = localStorage.getItem('battle_cache')
        const cacheData: battleCacheType = cache ? JSON.parse(cache) : {}
        if (Object.keys(cacheData).length) {
            // complete data import
            setClassCourseSelected(draft => {
                draft.importComplete = true
            })
            setIsUseCache(true)
        } else {
            alert('No cache stored!')
        }
    }

    function handleCleanCacheBtn() {
        localStorage.removeItem('battle_cache')
    }

    function handleDownloadCacheBtnClick() {
        const cache = localStorage.getItem('battle_cache')
        if (cache) {
            downloadAsExcel(JSON.parse(cache).class_data.students, {})
        } else {
            alert('No cache found!')
        }
    }

    return (
        <div className={'import-data-page'}>
            <form>
                <div className={'file-upload'}>
                    <h3>Upload class data</h3>
                    <input
                        onChange={(e) => {
                            setStudentFile(e.target.files ? e.target.files[0] : null)
                        }}
                        className='hidden'
                        id='import-c-file'
                        accept=".xlsx, .xls"
                        type='file'/>
                    <div className='file-upload-btn'>
                        <img className='w-5 inline-block' src={chooseFileIcon} alt='choose file icon'/>
                        <label className='hover:cursor-pointer inline-block' htmlFor='import-c-file'>
                            选择文件
                        </label>
                    </div>
                    <p>
                        {studentFile?.name}
                    </p>
                </div>
                <div className={'file-upload'}>
                    <h3>Upload question data</h3>
                    <input
                        onChange={(e) => {
                            setQuestionFile(e.target.files ? e.target.files[0] : null)
                        }}
                        className='hidden'
                        id='import-q-file'
                        accept=".xlsx, .xls"
                        type='file'/>
                    <div className='file-upload-btn'>
                        <img className='w-5 inline-block' src={chooseFileIcon} alt='choose file icon'/>
                        <label className='hover:cursor-pointer inline-block' htmlFor='import-q-file'>
                            选择文件
                        </label>
                    </div>
                    <p>
                        {questionFile?.name}
                    </p>
                </div>
                <div className={'control-btns'}>
                    <button
                        onClick={handleSubmitBtnClick}
                    >Submit
                    </button>
                    <button onClick={handleContinueBtn}>
                        Continue
                    </button>
                    <button onClick={handleCleanCacheBtn}>
                        Clear cache
                    </button>
                    <button onClick={handleDownloadCacheBtnClick}>Download Cache</button>
                </div>
            </form>
        </div>
    )
}

function SelectClassCoursePage() {
    const [classData, setClassData] = useAtom(classDataAtom)
    const [, setClassCourseSelected] = useImmerAtom(classCourseSelectedAtom)
    const availableCourses = useAtomValue(availableCoursesAtom)

    const classOptBox = useRef<HTMLSelectElement>(null)
    const courseOptBox = useRef<HTMLSelectElement>(null)

    useEffect(() => {
        setClassCourseSelected(draft => {
            if (classOptBox.current && courseOptBox.current) {
                draft.classID = Number(classOptBox.current.value)
                draft.courseID = Number(courseOptBox.current.value)
            }
        })
    });


    useEffect(() => {
        const fetchData = async () => {
            if (isBackendReady) {
                const res = await axios.get('/api/class')
                setClassData(res.data)
            } else {
                console.log('Backend is not ready, use mock data instead')
                if (isDev) {
                    setClassData(mockClass)
                } else {
                    try {
                        const storedData = localStorage.getItem('class')
                        if (storedData) {
                            const parsedData = JSON.parse(storedData)
                            setClassData(parsedData)
                        } else {
                            console.warn('No class data found in localStorage')
                            setClassData([])
                        }
                    } catch (err) {
                        console.error('Error reading from localStorage:', err)
                        setClassData([])
                    }
                }
            }
        }
        fetchData()
    }, [setClassData]);

    useEffect(() => {
        if (classOptBox.current) {
            setClassCourseSelected(pre => ({
                ...pre,
                classID: Number(classOptBox.current?.value)
            }))
        }

    }, [classData, setClassCourseSelected]);

    function handleClassOptChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const {name, value} = event.target
        setClassCourseSelected(pre => ({
            ...pre,
            [name]: Number(value)
        }))
    }

    function handleSubmitBtnClick() {
        setClassCourseSelected(draft => {
            draft.selectComplete = true
        })
    }

    return (
        <form>
            <label>
                选择班级
                <select
                name='classID'
                ref={classOptBox}
                onChange={handleClassOptChange}>
                    {classData.map((classData) => (
                        <option
                            key={classData.id}
                            value={classData.id}>
                            {classData.name}
                        </option>
                    ))}
                </select>
            </label>
            <label>
                选择课程
                <select
                    name={'courseID'}
                    ref={courseOptBox}
                    onChange={handleClassOptChange}>
                    {availableCourses.map((courseData) => (
                        <option
                            key={courseData.id}
                            value={courseData.id}>
                            {courseData.name}
                        </option>
                    ))}
                </select>
            </label>
            <button type="submit" onClick={handleSubmitBtnClick}>下一步</button>
        </form>
    )
}

function EndPage() {
    const navigate = useNavigate()
    const [, setBattleData] = useImmerAtom(battleAtom)
    const classStudents = useAtomValue(classStudentsAtom)
    const handleSubmitDataBtnClick = () => {
        const permData = localStorage.getItem('permanentSkillAssets')
        const parsedData = permData ? JSON.parse(permData) : {}

        // download battle data
        const ExcelData = classStudents.map(item => ({
            "id": item.id,
            "name": item.name,
            "username": item.username,
            "fish": item.fish,
            "score": item.score,
            "medKit": item.assets.medKit,
            "nucBomb": item.assets.nucBomb,
            "grenade": item.assets.grenade,
            ...parsedData[item.id]
            })
        )
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(ExcelData);

        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "students.xlsx");
        // downloadAsExcel(classStudents, parsedData)


        // reset question index, since over button's functioning is based on question-index change
        setBattleData(draft => {
            draft.questionIndex = -1
        })
        navigate('/')
    }

    function handleReplayBtnClick() {
        setBattleData(draft => {
            draft.questionIndex = -1
            draft.noBuzz = false
            draft.answerTimeCounter = 4
            draft.currentPlayers = []
            draft.currentSpeakerID = []
            draft.pastParticipantsID = {}
            draft.isBattleStart =  false
            draft.isBattleOver =  false
            draft.isDisplayAnswer =  false
            draft.isBaseScoreAltered = false
            draft.combatData = {
            result: {},
            buff: {}
            }
        })
    }

    return (
        <>
            <div className={"end-page"}>
                <h1>Game Over!</h1>
                <div className={"choose-area"}>
                    <button onClick={handleSubmitDataBtnClick}>Submit Data</button>
                    <button onClick={handleReplayBtnClick}>Replay</button>
                </div>
            </div>
        </>
    )
}


export default function BattlePage() {
    const classCourseSelected = useAtomValue(classCourseSelectedAtom)
    const isGameOver = useAtomValue(isGameOverAtom)
    if (classCourseSelected.importComplete) {
        return (
            <>
                {classCourseSelected.selectComplete
                    ? (!isGameOver ? <Battle /> : <EndPage />)
                    : <SelectClassCoursePage />}
            </>
        )
    } else {
        return <ImportClassCoursePage/>
    }

}