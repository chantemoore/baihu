export interface Skill {
    name: string
    zh_name: string
    price: number
    useTime: {
        beforeBattle: boolean,
        inBattle: boolean,
        beforeJudge: boolean,
        afterJudge: boolean,
        whenInjured: boolean,
        lessThan2: boolean,
        atQuickResponse: boolean
    },
    isDisposable: boolean
    effectIntro: string
    icon: string
    isAvailable: boolean
    comment?: string
}

export interface Assets {
    [key: string]: number
}

export interface SkillSlot {
    permanent: string[]
    temporary: string[]
}

export interface Hero {
    id: number
    name: string
    en_name: string
    level: number
    fair: () => void
}

export type QuestionType = "HealthPack" | "QuickResponse" | "General" | "Trial";
export interface Question {
    id: number
    stem: string
    options?: string[]
    answer: string
    type: QuestionType
    // type: string
    difficulty?: string
    tags?: string[]
    comment?: string
}

export interface Class {
    name: string
    students: Student[]
}

export interface Student {
    id: number
    name: string
    username: string
    assets: Assets
    avatar?: string
    bgImg?: string,
    dailyScore: {
        [key: string]: number
    },
    luckPoint: number
    isActive: boolean
    isPresent: boolean
}

export type PraiseLevels = 'level1' | 'level2' | 'level3' | 'level4' | 'homework';

export type PraiseLevelConfig = {
    [K in PraiseLevels]: number[];
};

type QuickResponseRules = {
    noBuzz: {
        win: number[],
        lose: number[]
    },
    buzz: {
        win: number[],
        lose: number[]
    }
}

type OtherQuestionRules = {
    win: number[],
    lose: number | number[]
}

type GameRules = {
    QuickResponse: QuickResponseRules,
    Normal: OtherQuestionRules,
    HealthPack: OtherQuestionRules,
    Trial: OtherQuestionRules
}

export interface BattleConfigType {
    isDev: boolean
    scoreMultiplier: number
    possibility: {
        airdrop: number;
    };
    counter: {
        "readyTime": {
            "general": number,
            "quickResponse": number
        },
        "answerTime": number
    }
    scoreConfig: {
        praiseLevel: PraiseLevelConfig
        gameRules: GameRules
    }
    cacheControl: {
        classDataAtomKey: string;
        classDataAtomCacheKey: string;
    }
}

export interface Commodity {
    id: string
    name: string
    amount: number
    price: number
    intro?: string
    type: 'Skill'
    extra?: string
    cover?: string
}