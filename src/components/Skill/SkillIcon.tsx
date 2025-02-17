import {Skills} from '@/models/Skill';


import './Skills.scss'

interface SkillIconProps {
    name: string
    quantity: number
    onClick?: () => void
    isDisabled?: boolean
    isDisPlayZh?: boolean
}


export function SkillIcon({ name, quantity, isDisabled = false, isDisPlayZh = true, onClick }: SkillIconProps) {
    const { zh_name, icon } = Skills[name]
    return (
        <div className={"skill"}>
            {isDisPlayZh && <h2 className={"skill-name"}>{zh_name}</h2>}
            <img
                onClick={onClick}
                className={`icon ${isDisabled && 'disabled'}`} src={icon} alt={`${name} icon`}/>
            <h3 className={!quantity ? 'empty' : ''}>{quantity}</h3>
        </div>
    )
}