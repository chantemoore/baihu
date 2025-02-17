import {useImmerAtom} from 'jotai-immer'

import {Card, Button } from 'antd';
import {PlusCircleOutlined, MinusCircleOutlined} from '@ant-design/icons'

import { allCommodityAtom } from '@/atoms/storeAtoms'

import './StoreCard.scss';

import { Commodity } from '@/types/types'

const { Meta } = Card

interface StoreCardProps {
    id: string
    commodity: Commodity
}

export default function StoreCard({ id, commodity: {name, amount, intro, cover, extra} }: StoreCardProps) {
    const [, setAllCommodity] = useImmerAtom(allCommodityAtom)

    return (
        <Card
            className={'store-card'}
            hoverable={true}
            actions={[
                <Button type="primary"
                        danger={true}
                        shape="circle"
                        disabled={amount - 1 < 0}
                        onClick={() => setAllCommodity(draft => {
                            draft[id].amount -= 1
                        })}
                        icon={<MinusCircleOutlined />}/>,
                <p className={'amount'}>{amount}</p>,
                <Button type="primary"
                        shape="circle"
                        onClick={() => setAllCommodity(draft => {
                            draft[id].amount += 1
                        })}
                        icon={<PlusCircleOutlined />}/>
                ]}
            extra={<p>{extra}</p>}
            cover={<img className={'store-card-cover'} src={cover} alt='skill icon'/> }>
            <Meta
                title={name}
                description={intro}
            />
        </Card>
    )
}