import { v4 as uuidv4 } from 'uuid'

import { BoxItem } from '@/types/box'

import { increaseSkillAssetByStuID, adjustScoreByID } from '@/utils/studentTools.ts'
import { Skills } from '@/models/Skill.ts'

import gradeIcon from '@/assets/icons/grade.png'

export const RareItems: BoxItem[] =  [
    {
        'id': uuidv4(),
        'name': '援军',
        'img': Skills['reliefTroop'].icon,
        'amount': 2,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Rare",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'reliefTroop', 2, setClassStudents)
        },
        "weight": 25,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '加倍',
        'img': Skills['double'].icon,
        'amount': 2,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Rare",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'double', 2, setClassStudents)
        },
        "weight": 20,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '金钟罩',
        'img': Skills['goldBell'].icon,
        'amount': 1,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Rare",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'goldBell', 1, setClassStudents)
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
        'rank': "Rare",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'nucBomb', 1, setClassStudents)
        },
        "weight": 7,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '闪避',
        'img': Skills['duck'].icon,
        'amount': 2,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Rare",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'duck', 2, setClassStudents)
        },
        "weight": 12,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '血包',
        'img': Skills['medKit'].icon,
        'amount': 2,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Rare",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'medKit', 2, setClassStudents)
        },
        "weight": 12,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '表现分',
        'img': gradeIcon,
        'amount': 6,
        'type': 'Score',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Rare",
        "onDraw": (openerID, setClassStudents) => {
            adjustScoreByID(6, setClassStudents, openerID)
        },
        "weight": 30,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '表现分',
        'img': gradeIcon,
        'amount': 7,
        'type': 'Score',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Rare",
        "onDraw": (openerID, setClassStudents) => {
            adjustScoreByID(7, setClassStudents, openerID)
        },
        "weight": 28,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '表现分',
        'img': gradeIcon,
        'amount': 8,
        'type': 'Score',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Rare",
        "onDraw": (openerID, setClassStudents) => {
            adjustScoreByID(8, setClassStudents, openerID)
        },
        "weight": 28,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '表现分',
        'img': gradeIcon,
        'amount': 5,
        'type': 'Score',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Rare",
        "onDraw": (openerID, setClassStudents) => {
            adjustScoreByID(5, setClassStudents, openerID)
        },
        "weight": 40,
        "isAvailable": true
    },
]