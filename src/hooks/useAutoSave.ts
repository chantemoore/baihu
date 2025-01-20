import {useEffect} from 'react';

export const useAutoSave = <T>(key: string, data: T): void => {
    useEffect(() => {
        const timer = setInterval(() => {
            try {
                localStorage.setItem(key, JSON.stringify(data))
            } catch (err) {
                console.error('auto save failed:', err)
            }
        }, 60000)
        return () => clearInterval(timer)
    }, [data, key]);
}