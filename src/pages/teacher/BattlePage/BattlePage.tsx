import { useEffect, useRef } from "react";
import { useNavigate } from 'react-router'
import axios from 'axios';
import { useAtom, useAtomValue } from 'jotai'
import { useImmerAtom } from 'jotai-immer'

import { Battle } from "@/components/Battle/Battle.tsx";

import { classCourseSelectedAtom, classDataAtom, availableCoursesAtom, battleAtom, isGameOverAtom } from '@/atoms/battleAtoms.ts'

import './BattlePage.scss'
import mockClass from '../../../../test/classes.json'

const isBackendReady = false


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
                setClassData(mockClass)
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
    const handleSubmitDataBtnClick = () => {
        // reset question index, since over button's functioning is based on question-index change
        setBattleData(draft => {
            draft.questionIndex = -1
        })
        navigate('/')
    }

    return (
        <>
            <div className={"end-page"}>
                <h1>Game Over!</h1>
                <div className={"choose-area"}>
                    <button onClick={handleSubmitDataBtnClick}>Submit Data</button>
                </div>
            </div>
        </>
    )
}


export default function BattlePage() {
    const classCourseSelected = useAtomValue(classCourseSelectedAtom)
    const isGameOver = useAtomValue(isGameOverAtom)
    return (
        <>
            {classCourseSelected.selectComplete
                ? (!isGameOver ? <Battle /> : <EndPage />)
                : <SelectClassCoursePage />}
        </>
    )
}