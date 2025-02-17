import { WritableDraft } from 'immer'

import configJson from '../../battleConfig.json'

import { BattleAtomType } from '@/types/atoms.ts'
import { Student, Question, BattleConfigType } from "@/types/types.ts";

import { aRandomNumber } from '@/utils/random-tools.ts'
import { adjustScoreByID } from '@/utils/studentTools.ts'

const BattleConfig = configJson as BattleConfigType
const globalMultiplier = BattleConfig.scoreMultiplier
const scoreChangeRules = BattleConfig.scoreConfig.gameRules

const getBaseScoreDeltaTable = () => ({
    QuickResponse: {
        noBuzz: {
            win: aRandomNumber(...scoreChangeRules.QuickResponse.noBuzz.win as [number, number]) * globalMultiplier,
            lose: aRandomNumber(...scoreChangeRules.QuickResponse.noBuzz.lose as [number, number]) * globalMultiplier
        },
        buzz: {
            win: aRandomNumber(...scoreChangeRules.QuickResponse.buzz.win as [number, number]) * globalMultiplier,
            lose: aRandomNumber(...scoreChangeRules.QuickResponse.buzz.lose as [number, number]) * globalMultiplier
        }
    },
    Normal: {
        win: aRandomNumber(...scoreChangeRules.Normal.win as [number, number]) * globalMultiplier,
        lose: aRandomNumber(...scoreChangeRules.Normal.lose as [number, number]) * globalMultiplier
    },
    HealthPack: {
        win: aRandomNumber(...scoreChangeRules.HealthPack.win as [number, number]) * globalMultiplier,
        lose: 0
    },
    Trial: {
        win: aRandomNumber(...scoreChangeRules.Trial.win as [number, number]) * globalMultiplier,
        lose: aRandomNumber(...scoreChangeRules.Trial.lose as [number, number]) * globalMultiplier
    }
})



export default function calculateResult(setClassStudents: (fn: (draft: WritableDraft<Student[]>) => void) => void,
                                        battleData: BattleAtomType,
                                        setBattleData: (fn: (draft: WritableDraft<BattleAtomType>) => void) => void,
                                        isJudgeFinished: boolean,
                                        currentQuestion: Question | null,
                                        currentDay: string) {
    const { currentSpeakerID, combatData, multiplier, currentPlayers } = battleData
    const baseScoreDeltaTable = getBaseScoreDeltaTable()

    let baseScoreDelta : number
    // let extraScoreDelta: number = 0
    const [mainSpeakerStuID, rivalrySpeakerID] = [currentSpeakerID[0], currentPlayers.find(s => s.id !== currentSpeakerID[0])?.id as number]
    const [isMainSpeakerWin, ] = [combatData.result[mainSpeakerStuID], combatData.result[rivalrySpeakerID]]

    function eliminateSkillByName(speakerID: number, name: string) {
        setBattleData(draft => {
            draft.combatData.buff[speakerID].delete(name)
        })
    }

    // quick response and nobody buzzed
    if (currentQuestion?.type === 'QuickResponse' && battleData.noBuzz) {
        // win, get 10 points
        if (isMainSpeakerWin) {
            baseScoreDelta = baseScoreDeltaTable.QuickResponse.noBuzz.win * multiplier
        } else {
            // lose, subduct 30 points
            baseScoreDelta = baseScoreDeltaTable.QuickResponse.noBuzz.lose * multiplier
        }
    } else if (currentQuestion?.type === 'QuickResponse' && !battleData.noBuzz) {
        // win, get 20 points
        if (isMainSpeakerWin) {
            baseScoreDelta = baseScoreDeltaTable.QuickResponse.buzz.win * multiplier
        } else {
            // lose, subduct 20 points
            baseScoreDelta = baseScoreDeltaTable.QuickResponse.buzz.lose * multiplier
        }
    }

    // normal question
    else if (currentQuestion?.type === 'General') {
        // console.log('a general question')

        // win, get 15 points
        if (combatData.result[mainSpeakerStuID]) {
            baseScoreDelta = baseScoreDeltaTable.Normal.win * multiplier
        } else {
            baseScoreDelta = baseScoreDeltaTable.Normal.lose * multiplier
        }
    } else if (currentQuestion?.type === 'Trial') {
        if (combatData.result[mainSpeakerStuID]) {
            baseScoreDelta = baseScoreDeltaTable.Trial.win * multiplier
        } else {
            baseScoreDelta = baseScoreDeltaTable.Trial.lose * multiplier
        }
    } else {
        if (combatData.result[mainSpeakerStuID]) {
            baseScoreDelta = baseScoreDeltaTable.HealthPack.win * multiplier
        } else {
            baseScoreDelta = baseScoreDeltaTable.HealthPack.lose * multiplier
        }
    }
    console.log('I run yes!', 'score delta', baseScoreDelta, '->', currentSpeakerID[0])

    const mainSpeakerSkills = combatData.buff[mainSpeakerStuID]
    const rivalSpeakerSkills = combatData.buff[rivalrySpeakerID]
    // goldBell effect
    if (mainSpeakerSkills.has('goldBell') && baseScoreDelta < 0) {
        baseScoreDelta = 0
        eliminateSkillByName(mainSpeakerStuID, 'goldBell')
    }
    if (!battleData.isBaseScoreAltered) {
        adjustScoreByID(baseScoreDelta, setClassStudents, mainSpeakerStuID, currentDay)
        setBattleData(draft => {
            draft.isBaseScoreAltered = true
        })
    }

    console.log('main', mainSpeakerSkills)
    if(rivalSpeakerSkills.has('grenade') && isJudgeFinished) {
        // if (isMainSpeakerWin && !isRivalrySpeakerWin) {
        //     adjustScoreByID(-5, setClassStudents, rivalrySpeakerID, currentDay)
        // } else if(!isMainSpeakerWin && isRivalrySpeakerWin) {
        //     adjustScoreByID(-5, setClassStudents, mainSpeakerStuID, currentDay)
        // } else if(!isMainSpeakerWin && !isRivalrySpeakerWin) {
        //     adjustScoreByID(-20, setClassStudents, mainSpeakerStuID, currentDay)
        //     adjustScoreByID(-20, setClassStudents, rivalrySpeakerID, currentDay)
        // }
        // eliminateSkillByName(mainSpeakerStuID, 'grenade')
        if (!isMainSpeakerWin) {
            adjustScoreByID(-50, setClassStudents, mainSpeakerStuID, currentDay)
        }
        eliminateSkillByName(rivalrySpeakerID, 'grenade')

    }
}

