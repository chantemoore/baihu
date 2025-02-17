import { WritableDraft } from 'immer'
import { Student } from "@/types/types";

export interface BoxItem {
    id: string
    name: string
    img: string
    amount: number
    type: 'Skill' | 'Score' | 'Damage'
    rank: 'Ultimate' | 'Legendary' | 'Epic' | 'Elite' | 'Rare' | 'Common'
    tags: ('Surprise' | 'Airdrop')[]
    onDraw?: (openerID: number, setClassStudents: (fn: (draft: WritableDraft<Student[]>) => void) => void) => void
    weight: number
    isAvailable: boolean
}

export interface BoxItemGroup {
    rank: BoxItem["rank"]
    items: BoxItem[]
    weight: number
}
