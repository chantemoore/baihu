import { Student, Class } from '@/types/types.ts'
import {getMonthDay} from '@/utils/dateTools.ts';

const today = getMonthDay(new Date())

export const exampleDevClass: Class = {
    name: 'example',
    students: [
        {
        id: 1,
        name: '马某国',
        username: '浑圆形意太极掌门人',
        avatar: '',
        bgImg: '',
        assets: {
            'duck': 3,
            'slap': 10
        },
        dailyScore: {
            [today]: 100
        },
        luckPoint: 0,
        isActive: true,
        isPresent: true
    },
        {
            id: 2,
            name: '蔡某坤',
            username: '篮球带师',
            avatar: '',
            bgImg: '',
            assets: {
                'duck': 2,
                'slap': 1
            },
            dailyScore: {
                [today]: 90
            },
            luckPoint: 0,
            isActive: true,
            isPresent: true
        },
        {
            id: 3,
            name: 'Huzai',
            username: 'huzai',
            avatar: '',
            bgImg: '',
            assets: {
                'duck': 999,
                'double': 1
            },
            dailyScore: {
                [today]: 100
            },
            luckPoint: 0,
            isActive: false,
            isPresent: true
        }
    ]
}

export const exampleClass: Class = {
    name: 'example',
    students: [
        {
            id: 1,
            name: '马某国',
            username: '',
            avatar: '',
            bgImg: '',
            assets: {
                'duck': 3,
                'medKit': 1,
                'reliefTroop': 1,
                'double': 1,
            },
            dailyScore: {
                [today]: 100
            },
            luckPoint: 0,
            isActive: true,
            isPresent: true
        }
    ]
}

export const ClassExcelBaseColumns: {
    key: keyof Student | string
    title: string
    formatter?: (student: Student) => any
}[] = [
    {key: 'id', title: 'id'},
    {key: 'name', title: 'name'},
    {key: 'username', title: 'username'},
    {key: 'avatar', title: 'avatar'},
    {key: 'bgImg', title: 'bgImg'},
    {key: 'luckPoint', title: 'luckPoint'},
    {
        key: 'isActive',
        title: 'isActive',
        formatter: (student) => student.isActive ? 1 : 0
    },
    {
        key: 'isPresent',
        title: 'isPresent',
        formatter: (student) => student.isPresent ? 1 : 0
    },
    {
        key: 'duck',
        title: 'duck',
        formatter: (student) => student.assets?.duck || 0
    },
    {
        key: 'spinner',
        title: 'spinner',
        formatter: (student) => student.assets?.spinner || 0
    },
    {
        key: 'reliefTroop',
        title: 'reliefTroop',
        formatter: (student) => student.assets?.reliefTroop || 0
    },
    {
        key: 'grenade',
        title: 'grenade',
        formatter: (student) => student.assets?.grenade || 0
    },
    {
        key: 'double',
        title: 'double',
        formatter: (student) => student.assets?.double || 0
    },
    {
        key: 'goldBell',
        title: 'goldBell',
        formatter: (student) => student.assets?.goldBell || 0
    },
    {
        key: 'medKit',
        title: 'medKit',
        formatter: (student) => student.assets?.medKit || 0
    },
    {
        key: 'nucBomb',
        title: 'nucBomb',
        formatter: (student) => student.assets?.nucBomb || 0
    },
    {
        key: 'bunker',
        title: 'bunker',
        formatter: (student) => student.assets?.bunker || 0
    },
    {
        key: 'slap',
        title: 'slap',
        formatter: (student) => student.assets?.slap || 0
    }
]

// export const generateClassExcelColumns = (classData: Class) => {
//     const allDates = new Set<string>()
//     classData.students.forEach(stu => {
//         if (stu.dailyScore) {
//             Object.keys(stu.dailyScore).forEach(date => allDates.add(date))
//         }
//     })
//
//     const scoreColumns = Array.from(allDates).sort().map(date => ({
//         key: date,
//         title: date,
//         formatter: (student: Student) => student.dailyScore?.[date] || 100
//     }))
//
//     return [...ClassExcelBaseColumns, ...scoreColumns]
// }