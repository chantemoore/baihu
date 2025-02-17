import { Student } from './types'
import { BoxItem } from './box'

export interface BattleAtomType {
    noBuzz: boolean,
    currentPlayers: Student[]
    currentSpeakerID: number[],
    reliefPerson: null | Student,
    isBattleStart: boolean,
    isBattleOver: boolean,
    isBaseScoreAltered: boolean,
    isDisplayAnswer: boolean,
    airdropContent: BoxItem | null,
    airdropDisplay: {
        icon:  boolean,
        result: boolean
    }
    multiplier: number
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






