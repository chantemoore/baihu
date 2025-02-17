import skillData from '@/models/skills.json'

import { Skill } from '@/types/types'

const processedSkillData = Object.entries(skillData).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: {
        name: key,
        ...value
    }
}), {})

type SkillsType = {[skill: string]: Skill}

export const Skills = processedSkillData as SkillsType
