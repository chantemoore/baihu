import {useEffect, useState} from 'react'
import CountUp from 'react-countup'

import './Score.scss';

interface ScoreProps {
    className?: string
    value: number
    duration?: number
    prefix?: string
    suffix?: string
    separator?: string
    decimal?: string
    decimals?: number
}
export function Score({
      value,
      duration = 3,
      prefix = '',
      suffix = '',
      separator = ',',
      decimal = '.',
      decimals = 0
  }: ScoreProps) {
        const [preValue, setPreValue] = useState(value)

        useEffect(() => {
            // 当 value 变化时，先保存旧值，然后更新 key 触发重渲染
            // 延迟更新 preValue，确保动画效果完成
            const timer = setTimeout(() => {
                setPreValue(value);
            }, duration * 1000);

            return () => clearTimeout(timer);
        }, [value, duration]);

        return (
            <CountUp
                className={'score'}
                start={preValue}
                end={value}
                duration={duration}
                separator={separator}
                decimal={decimal}
                decimals={decimals}
                prefix={prefix}
                suffix={suffix}
            />
        )
}