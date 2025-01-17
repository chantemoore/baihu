import { Draft, WritableDraft } from 'immer'

import { BattleAtomType } from '@/types/atoms.ts'
import { Student, Question } from "@/types/types.ts";

import { aRandomNumber } from '@/utils/random-tools.ts'


const getBaseScoreDeltaTable = () => ({
    QuickResponse: {
        noBuzz: {
            win: aRandomNumber(8, 10),
            lose: aRandomNumber(-30, -20)
        },
        buzz: {
            win: 20,
            lose: -20
        }
    },
    Normal: {
        win: aRandomNumber(10, 15),
        lose: aRandomNumber(5, 8)
    },
    HealthPack: {
        win: aRandomNumber(8, 15),
        lose: 0
    }
})


export function adjustScore(delta: number,
                            setClassStudents:  (fn: (draft: WritableDraft<Student[]>) => void) => void,
                            stuID: number) {
    setClassStudents((draft: Draft<Student[]>) => {
        const student = draft.find(s => s.id === stuID)
        if(student) {
            student.score += delta
        }
    })
}

export default function calculateResult(setClassStudents: (fn: (draft: WritableDraft<Student[]>) => void) => void,
                                        battleData: BattleAtomType,
                                        setBattleData: (fn: (draft: WritableDraft<BattleAtomType>) => void) => void,
                                        isJudgeFinished: boolean,
                                        currentQuestion: Question | null) {
    const { currentSpeakerID, combatData } = battleData
    const baseScoreDeltaTable = getBaseScoreDeltaTable()

    let baseScoreDelta : number
    // let extraScoreDelta: number = 0
    const [mainSpeakerStuID, rivalrySpeakerID] = currentSpeakerID
    const [isMainSpeakerWin, isRivalrySpeakerWin] = [combatData.result[mainSpeakerStuID], combatData.result[rivalrySpeakerID]]

    function eliminateSkillByName(speakerID: number, name: string) {
        setBattleData(draft => {
            draft.combatData.buff[speakerID].delete(name)
        })
    }
    console.log('info', currentQuestion?.type, battleData.noBuzz)

    // quick response and nobody buzzed
    if (currentQuestion?.type === 'QuickResponse' && battleData.noBuzz) {
        // win, get 10 points
        if (isMainSpeakerWin) {
            baseScoreDelta = baseScoreDeltaTable.QuickResponse.noBuzz.win
        } else {
            // lose, subduct 30 points
            baseScoreDelta = baseScoreDeltaTable.QuickResponse.noBuzz.lose
        }
    } else if (currentQuestion?.type === 'QuickResponse' && !battleData.noBuzz) {
        // win, get 20 points
        if (isMainSpeakerWin) {
            baseScoreDelta = baseScoreDeltaTable.QuickResponse.buzz.win
        } else {
            // lose, subduct 20 points
            baseScoreDelta = baseScoreDeltaTable.QuickResponse.buzz.lose
        }
    }

    // normal question
    else if (currentQuestion?.type === 'General') {
        // console.log('a general question')

        // win, get 15 points
        if (combatData.result[mainSpeakerStuID]) {
            baseScoreDelta = baseScoreDeltaTable.Normal.win
        } else {
            baseScoreDelta = -baseScoreDeltaTable.Normal.lose
        }
    } else {
        if (combatData.result[mainSpeakerStuID]) {
            baseScoreDelta = baseScoreDeltaTable.HealthPack.win
        } else {
            baseScoreDelta = baseScoreDeltaTable.HealthPack.lose
        }
    }
    console.log('I run yes!', baseScoreDelta, currentSpeakerID[0])

    const mainSpeakerSkills = combatData.buff[mainSpeakerStuID]
    // goldBell effect
    if (mainSpeakerSkills.has('goldBell') && baseScoreDelta < 0) {
        baseScoreDelta = 0
        eliminateSkillByName(mainSpeakerStuID, 'goldBell')
    }
    if (!battleData.isBaseScoreAltered) {
        adjustScore(baseScoreDelta, setClassStudents, mainSpeakerStuID)
        setBattleData(draft => {
            draft.isBaseScoreAltered = true
        })
    }

    if(mainSpeakerSkills.has('grenade') && isJudgeFinished) {
        if (isMainSpeakerWin && !isRivalrySpeakerWin) {
            adjustScore(-5, setClassStudents, rivalrySpeakerID)
        } else if(!isMainSpeakerWin && isRivalrySpeakerWin) {
            adjustScore(-5, setClassStudents, mainSpeakerStuID)
        } else if(!isMainSpeakerWin && !isRivalrySpeakerWin) {
            adjustScore(-20, setClassStudents, mainSpeakerStuID)
            adjustScore(-20, setClassStudents, rivalrySpeakerID)
        }
        eliminateSkillByName(mainSpeakerStuID, 'grenade')
    }
}

