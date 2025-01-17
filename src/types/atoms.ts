import { Student, Question } from './types'

export interface BattleAtomType {
    questionIndex: number,
    noBuzz: boolean,
    answerTimeCounter: number,
    totalQuestions: Question[],
    currentPlayers: Student[]
    currentSpeakerID: number[],
    pastParticipantsID: {[questionIndex: number]: number[]},
    isBattleStart: boolean,
    isBattleOver: boolean,
    isBaseScoreAltered: boolean,
    isDisplayAnswer: boolean
    combatData: {
        result: {
            [key: number]: boolean | null
        }
        buff: {
            [key: number]: Set<string>
        }
    }
}


export interface userAtom {
    id?: number
    username?: string
}






