export const aRandomNumber = (stat: number, end: number) => {
        return Math.floor(Math.random() * (end - stat + 1)) + stat;
    }

export const getRandomNumberInRange = (stat: number, end: number) => {
    return Math.floor(Math.random() * (end - stat)) + stat
}
export const get1RandomElement = <T>(array: T[]) => {
    return array[Math.floor(Math.random() * array.length)]
}

export const get2RandomElement = <T>(array: T[], diff: boolean = true) => {
    let indices: Set<number> | number[]
    const arrayLength = array.length
    if (arrayLength >= 2) {
        if (diff) {
            indices = new Set<number>
            while (indices.size < 2) {
                const randomIndex = aRandomNumber(0, arrayLength - 1)
                indices.add(randomIndex)
            }
            return Array.from(indices).map(index => array[index])
        } else {
            indices = []
            while (indices.length < 2) {
                const randomIndex = aRandomNumber(0, arrayLength - 1)
                indices.push(randomIndex)
            }
            return indices.map(index => array[index])
        }
    } else {
        return []
    }
}

export interface WeightedItem<T> {
    item: T;
    weight: number;
}

export class WeightedRandomPicker<T> {
    private readonly totalWeight: number;

    constructor(private items: WeightedItem<T>[]) {
        this.totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
    }

    pick(): T {
        const random = Math.random() * this.totalWeight;
        let weightSum = 0;

        for (const { item, weight } of this.items) {
            weightSum += weight;
            if (random <= weightSum) {
                return item;
            }
        }
        // 保底返回第一个对象
        return this.items[0].item;
    }
}

