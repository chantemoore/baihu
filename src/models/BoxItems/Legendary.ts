import { v4 as uuidv4 } from 'uuid'

import { BoxItem } from '@/types/box'

import { increaseSkillAssetByStuID, adjustScoreByID } from '@/utils/studentTools.ts'
import { Skills } from '@/models/Skill.ts'

import gradeIcon from '@/assets/icons/grade.png'

export const LegendaryItems: BoxItem[] =  [
    {
        'id': uuidv4(),
        'name': '金钟罩',
        'img': Skills['goldBell'].icon,
        'amount': 2,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Rare",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'goldBell', 2, setClassStudents)
        },
        "weight": 15,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '原子弹',
        'img': Skills['nucBomb'].icon,
        'amount': 1,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Legendary",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'nucBomb', 2, setClassStudents)
        },
        "weight": 20,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '闪避',
        'img': Skills['duck'].icon,
        'amount': 3,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Legendary",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'duck', 2, setClassStudents)
        },
        "weight": 20,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '血包',
        'img': Skills['medKit'].icon,
        'amount': 3,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Legendary",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'medKit', 3, setClassStudents)
        },
        "weight": 20,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '表现分',
        'img': gradeIcon,
        'amount': 15,
        'type': 'Score',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Legendary",
        "onDraw": (openerID, setClassStudents) => {
            adjustScoreByID(15, setClassStudents, openerID)
        },
        "weight": 30,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '表现分',
        'img': gradeIcon,
        'amount': 10,
        'type': 'Score',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Legendary",
        "onDraw": (openerID, setClassStudents) => {
            adjustScoreByID(10, setClassStudents, openerID)
        },
        "weight": 50,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '表现分',
        'img': gradeIcon,
        'amount': 12,
        'type': 'Score',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Legendary",
        "onDraw": (openerID, setClassStudents) => {
            adjustScoreByID(12, setClassStudents, openerID)
        },
        "weight": 60,
        "isAvailable": true
    },
]