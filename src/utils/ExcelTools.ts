import * as XLSX from 'xlsx'

import { Student, Class, Assets, SkillSlot, Question } from '@/types/types'
import { ClassExcelBaseColumns } from '@/types/ExcelColumns.ts'

const generateClassExcelColumns = (classData: Class) => {
    const allDates = new Set<string>()
    classData.students.forEach(stu => {
        if (stu.dailyScore) {
            Object.keys(stu.dailyScore).forEach(date => allDates.add(date))
        }
    })

    const scoreColumns = Array.from(allDates).sort().map(date => ({
        key: date,
        title: date,
        formatter: (student: Student) => student.dailyScore?.[date] || 100
    }))

    return [...ClassExcelBaseColumns, ...scoreColumns]
}

export const saveClassAsExcel = (classData: Class) => {
    const excelData = classData.students.map(student => {
        const rowData: {[key: string]: string | number | boolean| undefined | Assets} = {}
        const ExcelColumns = generateClassExcelColumns(classData)
        ExcelColumns.forEach(column => {
            if(column.formatter) {
                rowData[column.title] = column.formatter(student)
            } else {
                rowData[column.title] = student[column.key as keyof Student]
            }
        })
        return rowData
    })

    // create workbook
    const workBook = XLSX.utils.book_new()
    // create worksheet
    const workSheet = XLSX.utils.json_to_sheet(excelData)
    XLSX.utils.book_append_sheet(workBook, workSheet, 'sheet')
    XLSX.writeFile(workBook, `${classData.name}.xlsx`)
}

export async function importExcelAsClassData(file: File): Promise<Class> {
    // 读取 Excel 文件
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const rawData = XLSX.utils.sheet_to_json(worksheet)

    const headers = Object.keys(rawData[0] || {})

    // 找出日期列（所有不是基础属性和道具的列）
    const basicProps = ['id', 'name', 'username', 'avatar', 'bgImg', 'isActive', 'luckPoint', 'isPresent']
    const assetProps = ['duck', 'spinner', 'reliefTroop', 'grenade', 'mine',
        'goldBell', 'medKit', 'nucBomb', 'bunker', 'slap']
    const dateCols = headers.filter(h =>
        !basicProps.includes(h) &&
        !assetProps.includes(h)
    )

    // 转换为 Student 对象数组
    return {
        name: file.name.split('.').slice(0, -1).join('.'),
        students: rawData.map((row: any) => {

            // 处理 dailyScore
            const dailyScore: { [key: string]: number } = {}
            dateCols.forEach(date => {
                if (row[date] !== undefined) {
                    dailyScore[date] = Number(row[date])
                }
            })

            // 构建 assets 对象
            const assets = {
                duck: Number(row.duck) || 0,
                spinner: Number(row.spinner) || 0,
                reliefTroop: Number(row.reliefTroop) || 0,
                grenade: Number(row.grenade) || 0,
                double: Number(row.double) || 0,
                goldBell: Number(row.goldBell) || 0,
                medKit: Number(row.medKit) || 0,
                nucBomb: Number(row.nucBomb) || 0,
                bunker: Number(row.bunker) || 0,
                slap: Number(row.slap) || 0
            }

            // 返回完整的 Student 对象
            return {
                id: row.id,
                name: row.name,
                username: row.username || '',
                avatar: row.avatar || '',
                bgImg: row.bgImg || '',
                isActive: Boolean(Number(row.isActive)),
                isPresent: Boolean(Number(row.isPresent)),
                luckPoint: row.luckPoint || 0,
                assets,
                dailyScore
            }
        })
    }
}

export const convertQuestionExcelToJson = async (file: File): Promise<Question[]> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
            try {
                const data = event.target?.result
                const workBook = XLSX.read(data, {type: "binary"})
                const worksheet = workBook.Sheets[workBook.SheetNames[0]]
                const jsonData = XLSX.utils.sheet_to_json(worksheet)
                resolve(jsonData)
            } catch (err) {
                reject(err)
            }
        }
        reader.onerror = (err) => reject(err)
        reader.readAsArrayBuffer(file)
    })
}


export const exportBattleData = (classData: Class, classDataCache: string | null, tomorrowDate: string, skillSlot: SkillSlot) => {
    const saveClassData = structuredClone(classData)

    if (classDataCache) {
        const classDateCacheJson: Class = JSON.parse(classDataCache)
        saveClassData.students.forEach(stuObj => {
            stuObj.dailyScore[tomorrowDate] = 100
            const allSkills = Object.keys(stuObj.assets)
            allSkills.forEach((skillKey) => {
                if (skillSlot.permanent.includes(skillKey)) {
                    const studentInCache = classDateCacheJson.students.find(stu => stu.id === stuObj.id)
                    if (studentInCache) {
                        stuObj.assets[skillKey] = studentInCache.assets[skillKey]
                    }
                }
            })
        })
    }
    saveClassAsExcel(saveClassData)
}

