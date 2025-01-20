import * as XLSX from 'xlsx'

import { Student } from '@/types/types'

export const downloadAsExcel = <T>(classStudents: Student[], addition: T) => {
    const ExcelData = classStudents.map(item => ({
            "id": item.id,
            "name": item.name,
            "username": item.username,
            "fish": item.fish,
            "score": item.score,
            "medKit": item.assets.medKit,
            "nucBomb": item.assets.nucBomb,
            ...addition
        })
    )
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(ExcelData);

    // 将工作表添加到工作簿
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students.xlsx");
}