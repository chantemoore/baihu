import { atom} from 'jotai';
import { atomWithDefault } from 'jotai/utils';

import { skillSlotAtom } from '@/atoms/battleAtoms'

import { Skills } from '@/models/Skill.ts'

import { Commodity } from '@/types/types'


interface allCommodityType {
    [id: string]: Commodity
}

const baseAllCommodityAtom = atom<allCommodityType>((get) => {
    const skillSlot = get(skillSlotAtom)
    const allSkillCommodity: Commodity[] = [...skillSlot.temporary, ...skillSlot.permanent].map(skillName => {
        const Skill = Skills[skillName]
        return {
            id: Skill.name,
            name: Skill.zh_name,
            amount: 0,
            price: Skill.price,
            intro: Skill.effectIntro,
            type: 'Skill',
            cover: Skill.icon,
            extra: Skill.isDisposable ? '一次性' : '永久'
        }
    })
    const allCommodity: allCommodityType  = Object.fromEntries(allSkillCommodity.map((item, _) => [item.id, item]))
    return allCommodity
})

export const allCommodityAtom = atomWithDefault((get) => get(baseAllCommodityAtom))


export const totalPriceAtom = atom((get) => {
    const allCommodity = get(allCommodityAtom)
    return Object.values(allCommodity).reduce((total, commodity) => {
        return total + (commodity.price * commodity.amount)
    }, 0)
})
