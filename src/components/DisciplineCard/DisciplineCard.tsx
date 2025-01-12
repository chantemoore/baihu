import { Draft, WritableDraft } from 'immer'

import { Student } from '@/types/types'
import './DisciplineCard.scss'

export default function DisciplineCard(student: WritableDraft<Student>,
                                       setStudentsData: (fn: (draft: WritableDraft<Student[]>) => void) => void) {
    const {id, name, fish, score} = student
    const aRandomNumber = (stat: number, end: number) => {
        return Math.floor(Math.random() * (end - stat + 1)) + stat;
    }

    const punishRules = {
        level1: () => {
            setStudentsData(draft => {
                const student = draft.find(s => s.id === id)
                if (student) {
                    student.score += -3
                }
            })
        },
        level2: () => {
            setStudentsData(draft => {
                const student = draft.find(s => s.id === id)
                if (student) {
                    student.score += -9 + aRandomNumber(-2, 2)
                    const futureFish = student.fish - 1
                    if (futureFish >= 0) {
                        student.fish -= 1
                    }
                }
            })
        },
        level3: () => {
            setStudentsData(draft => {
                const student = draft.find(s => s.id === id)
                if (student) {
                    student.score += -81 + aRandomNumber(-2, 2)
                    student.fish = 0
                }
            })
        }
    }

    const praiseRules = {
        level1: () => {
            setStudentsData(draft => {
                const student = draft.find(s => s.id === id)
                if (student) {
                    student.score += 2 + aRandomNumber(-1, 2)
                }
            })
        },
        level2: () => {
            setStudentsData(draft => {
                const student = draft.find(s => s.id === id)
                if (student) {
                    student.score += 4 + aRandomNumber(-1, 3)
                }
            })
        },
        level3: () => {
            setStudentsData(draft => {
                const student = draft.find(s => s.id === id)
                if (student) {
                    student.score += 5 + aRandomNumber(-1, 4)
                    student.fish += 1
                }
            })
        },
        level4: () => {
            setStudentsData(draft => {
                const student = draft.find(s => s.id === id)
                if (student) {
                    student.score += 10 + aRandomNumber(0, 5)
                }
            })
        }
    }

    return (
        <div className={'student-disc-card'}>
            <div className={'name'}>
                <h1>{name}</h1>
                <p>{fish}</p>
            </div>
            <div className={'score'}>
                {score}
            </div>
            <div className={'control-panel'}>
                <section className={'punish'}>
                    {Object.entries(punishRules)
                        .sort(([a], [b]) => Number(a.slice(-1)) - Number(b.slice(-1)))
                        .map(([level, callback]) => (
                            <button
                                key={level}
                                onClick={callback}
                                className="punish-btn"
                            >
                                🚫{level.slice(-1)}
                            </button>
                        ))
                    }
                    {/*<button>🚫</button>*/}
                </section>
                <section className={'praise'}>
                    <button>👍</button>
                </section>
            </div>
        </div>
    )
}
