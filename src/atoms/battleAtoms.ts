import { atom } from 'jotai'
import { atomWithDefault, atomWithStorage, atomWithReset } from 'jotai/utils'

import { BattleAtomType } from '../types/atoms.ts'
import { Question, SkillSlot } from '../types/types.ts'
import BattleConfig from '@/../battleConfig.json'
import {Skills} from '@/models/Skill.ts'
import { getMonthDay } from '@/utils/dateTools.ts'

const generalReadyTime = !BattleConfig.isDev ? BattleConfig.counter.readyTime.general : 1
const quickResponseReadyTime = !BattleConfig.isDev ? BattleConfig.counter.readyTime.quickResponse : 1
export const answerTime = BattleConfig.counter.answerTime

export const skillSlotAtom = atom<SkillSlot>({
    permanent: Object.keys(Skills).filter(skillName=> !Skills[skillName].isDisposable && Skills[skillName].isAvailable),
    temporary: Object.keys(Skills).filter(skillName=> Skills[skillName].isDisposable && Skills[skillName].isAvailable)
})


export const battleAtom = atomWithReset<BattleAtomType>({
    noBuzz: false,
    currentPlayers: [],
    // main speaker is at the head
    currentSpeakerID: [],
    reliefPerson: null,
    isBattleStart: false,
    isBattleOver: false,
    isDisplayAnswer: false,
    airdropContent: null,
    airdropDisplay: {
        icon: true,
        result: false
    },
    isBaseScoreAltered: false,
    multiplier: 1,
    combatData: {
        result: {},
        buff: {}
    }
})

export const winnerAtom = atom((get) => {
    const battleData = get(battleAtom)
    return battleData.currentPlayers.filter(player => battleData.combatData.result[player.id])
})

export const answerTimeCounterAtom = atomWithReset(answerTime)

const _currentDateAtom = atom((() => new Date())())



export const currentDayAtom = atom((get) => {
    const today = get(_currentDateAtom)
    return getMonthDay(today)
})

export const tomorrowDateAtom = atom((get) => {
    const today = get(_currentDateAtom)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    return getMonthDay(tomorrow)
})
export const questionIndexAtom = atom(-1)

export const airdropActiveAtom = atom((get) => {
    const currentQuestionIndex = get(questionIndexAtom)
    const currentQuestion= get(currentQuestionAtom)
    return currentQuestionIndex >= -1 && (Math.random() < BattleConfig.possibility.airdrop || currentQuestion?.type === 'Trial')
})

export const pastParticipantsAtom = atom<{[key: number]: number[]}>({})

export const totalQuestionsAtom = atomWithStorage<Question[]>('questions', [])

export const questionsNameAtom = atomWithStorage('questions_name', '')

export const readyTimeCounterAtom = atomWithDefault((get) => {
    const currentQuestion = get(currentQuestionAtom)
    return currentQuestion?.type === 'QuickResponse' ? quickResponseReadyTime : generalReadyTime as number
})

export const isReadyTimeOverAtom = atom((get) => {
    const readyTimeCounter = get(readyTimeCounterAtom)
    return readyTimeCounter <= 0
})

export const isAnswerTimeOverAtom = atom((get) => {
    const answerTimerCounter = get(answerTimeCounterAtom)
    return answerTimerCounter <= 0
})

export const currentQuestionAtom = atom((get) => {
    const totalQuestions = get(totalQuestionsAtom)
    const questionIndex = get(questionIndexAtom)
    if (questionIndex >=0 && questionIndex <= totalQuestions.length) {
        return totalQuestions.length ? totalQuestions[questionIndex] : null
    } else {
        return null
    }
})

export const isJudgeFinishedAtom = atom((get) => {
    const battleData = get(battleAtom)
    const {combatData, isBattleOver, currentSpeakerID} = battleData
    // 1.have speaker 2.speaker number equals result length(assure everyone's mark is settled) 3.battle over
    return Object.keys(combatData.result).length === currentSpeakerID.length && isBattleOver && Boolean(currentSpeakerID.length);
})

export const isGameOverAtom = atom((get) => {
    const questionIndex = get(questionIndexAtom)
    const length = get(totalQuestionsAtom).length
    return length <= questionIndex
})


