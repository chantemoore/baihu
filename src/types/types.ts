export interface Skill {
    name: string
    zh_name: string
    useTime: {
        [key: string]: boolean
    },
    isDisposable: boolean
    effectIntro: string
    icon: string
}

export interface Assets {
    [key: string]: number
}

export interface SkillSlot {
    permanent: string[]
    temporary: string[]
}

export interface Student {
    id: number
    name: string
    username: string
    fish: number
    score: number
    assets: Assets
    skillSlot: SkillSlot
    avatar: string
    bgImg: string
}

export interface Question {
    id: number
    stem: string
    options?: string[]
    answer: string
    type: "HealthPack" | "QuickResponse" | "General"
    // type: string
    difficulty?: string
    tags?: string[]
    comment?: string
}

export interface Course {
    id: number
    name: string
}

export interface Class {
    id: number
    name: string
    courses: Course[]
    students: Student[]
}
