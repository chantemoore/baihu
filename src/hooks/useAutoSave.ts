import {useEffect} from 'react';


export const useAutoSave = <T>(key: string, data: T): void => {
    useEffect(() => {
        const timer = setInterval(() => {
            try {
                const cache = localStorage.getItem(key)
                const cacheData = JSON.parse(cache ? cache : '{}')
                cacheData[data.class_data.name] = data
                localStorage.setItem(key, JSON.stringify(cacheData))
            } catch (err) {
                console.error('auto save failed:', err)
            }
        }, 60000)
        return () => clearInterval(timer)
    }, [data, key]);
}