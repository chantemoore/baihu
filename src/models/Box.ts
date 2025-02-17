import { WritableDraft } from 'immer'

import { Student } from "@/types/types";
import { BoxItem, BoxItemGroup } from '@/types/box'


import { LegendaryItems } from './BoxItems/Legendary.ts'
import { RareItems } from './BoxItems/Rare.ts'
import { CommonItems } from './BoxItems/Common.ts'

export class SurpriseBox {
    private readonly itemGroups: BoxItemGroup[]
    private readonly maxLuckPoint: number
    private readonly totalGroupWeight: number

    constructor(itemGroups: BoxItemGroup[], maxLuckPoint: number) {
        this.itemGroups = itemGroups
        this.maxLuckPoint = maxLuckPoint
        this.totalGroupWeight = itemGroups.reduce((sum, group) => sum + group.weight, 0)
    }

    private pickGroup(forcedType?: BoxItem['rank']): BoxItemGroup {
        if (forcedType) {
            const group = this.itemGroups.find(g => g.rank === forcedType)
            if (!group) throw new Error(`No group found with this rank---> ${forcedType}!`)
            return group
        }
        const random = Math.random() * this.totalGroupWeight
        let weightSum = 0
        for (const group of this.itemGroups) {
            weightSum += group.weight
            if (random <= weightSum) {
                return group
            }
        }
        const defaultGroup = this.itemGroups.find(g => g.rank === 'Epic')
        return defaultGroup ? defaultGroup : this.itemGroups[0]
    }

    private pickItemFromGroup(group: BoxItemGroup): BoxItem {
        const totalWeight = group.items.reduce((sum, item) => sum + item.weight, 0)
        const random = Math.random() * totalWeight
        let weightSum = 0
        for (const item of group.items) {
            weightSum += item.weight
            if (random < weightSum) {
                return item
            }
        }
        return group.items[0]
    }

    open(openerID: number, setClassStudents: (fn: (draft: WritableDraft<Student[]>) => void) => void, times: number = 1, luckPoint: number): [BoxItem[], number] {
        const result: BoxItem[] = []
        let currentLuckPoint = luckPoint

        for (let i = 0; i < times; i++) {
            const futureLuckPoint = luckPoint + 1;
            const overflowPoint = futureLuckPoint - this.maxLuckPoint
            const group = this.pickGroup( overflowPoint >= 0 ? 'Ultimate' : undefined)
            const item = this.pickItemFromGroup(group)
            if (item.onDraw) {
                item.onDraw(openerID, setClassStudents)
            }
            result.push(item)
            currentLuckPoint = overflowPoint ? overflowPoint : futureLuckPoint
        }
        return [result, currentLuckPoint]
    }
}

const surpriseBox: BoxItemGroup[] = [
    {rank: 'Ultimate', items: [], weight: 5},
    {rank: 'Legendary', items: [], weight: 7},
    {rank: 'Epic', items: [], weight: 12},
    {rank: 'Elite', items: [], weight: 18},
    {rank: 'Rare', items: [], weight: 38},
    {rank: 'Common', items: [], weight: 68}
]

const airdropBox: BoxItemGroup[] = [
    {rank: 'Legendary', items: [], weight: 5},
    {rank: 'Epic', items: [], weight: 10},
    {rank: 'Elite', items: [], weight: 15},
    {rank: 'Rare', items: [], weight: 20},
    {rank: 'Common', items: [], weight: 78}
]

const prizePool: BoxItem[] = [
    ...LegendaryItems,
    ...RareItems,
    ...CommonItems
]

const surpriseBoxItems = prizePool.filter(b => b.tags.includes('Surprise'))

const airdropBoxItems = prizePool.filter(b => b.tags.includes('Airdrop'))

export const airdropBoxes = airdropBox.map(box => ({
    ...box,
    items: airdropBoxItems.filter(item => item.rank === box.rank)
})).filter(box => box.items.length > 0)

export const surpriseBoxes = surpriseBox.map(box => ({
    ...box,
    items: surpriseBoxItems.filter(item => item.rank === box.rank)
})).filter(box => box.items.length > 0)
