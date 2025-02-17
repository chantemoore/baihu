
export const getMonthDay = (date: Date): string => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}.${day}`
}