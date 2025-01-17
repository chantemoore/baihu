export const aRandomNumber = (stat: number, end: number) => {
        return Math.floor(Math.random() * (end - stat + 1)) + stat;
    }