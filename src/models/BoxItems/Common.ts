import { v4 as uuidv4 } from 'uuid'

import { BoxItem } from '@/types/box'

import { increaseSkillAssetByStuID, adjustScoreByID } from '@/utils/studentTools.ts'
import { Skills } from '@/models/Skill.ts'

import gradeIcon from '@/assets/icons/grade.png'
import theftIcon from '@/assets/icons/barbarian.png'

export const CommonItems: BoxItem[] =  [
    {
        'id': uuidv4(),
        'name': '援军',
        'img': Skills['reliefTroop'].icon,
        'amount': 1,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Common",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'reliefTroop', 1, setClassStudents)
        },
        "weight": 25,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '手榴弹',
        'img': Skills['grenade'].icon,
        'amount': 1,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Common",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'grenade', 1, setClassStudents)
        },
        "weight": 20,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '转盘',
        'img': Skills['spinner'].icon,
        'amount': 1,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Common",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'spinner', 1, setClassStudents)
        },
        "weight": 18,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '加倍',
        'img': Skills['double'].icon,
        'amount': 1,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Common",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'double', 1, setClassStudents)
        },
        "weight": 17,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '闪避',
        'img': Skills['duck'].icon,
        'amount': 1,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Common",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'duck', 1, setClassStudents)
        },
        "weight": 14,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '血包',
        'img': Skills['medKit'].icon,
        'amount': 1,
        'type': 'Skill',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Common",
        "onDraw": (openerID, setClassStudents) => {
            increaseSkillAssetByStuID(openerID, 'medKit', 1, setClassStudents)
        },
        "weight": 13,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '表现分',
        'img': gradeIcon,
        'amount': 4,
        'type': 'Score',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Common",
        "onDraw": (openerID, setClassStudents) => {
            adjustScoreByID(4, setClassStudents, openerID)
        },
        "weight": 39,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '表现分',
        'img': gradeIcon,
        'amount': 3,
        'type': 'Score',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Common",
        "onDraw": (openerID, setClassStudents) => {
            adjustScoreByID(3, setClassStudents, openerID)
        },
        "weight": 35,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '表现分',
        'img': gradeIcon,
        'amount': 2,
        'type': 'Score',
        'tags': ['Airdrop', 'Surprise'],
        'rank': "Common",
        "onDraw": (openerID, setClassStudents) => {
            adjustScoreByID(2, setClassStudents, openerID)
        },
        "weight": 43,
        "isAvailable": true
    },
    {
        'id': uuidv4(),
        'name': '但野人偷走了空投',
        'img': theftIcon,
        'amount': 0,
        'type': 'Damage',
        'tags': ['Airdrop'],
        'rank': "Common",
        "onDraw": (openerID, setClassStudents) => {
            console.log(openerID, setClassStudents)
        },
        "weight": 40,
        "isAvailable": true
    },
]