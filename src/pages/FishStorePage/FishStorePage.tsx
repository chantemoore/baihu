import {useAtomValue, useAtom} from 'jotai';
import { useResetAtom } from 'jotai/utils'
import {useSearchParams, useNavigate} from 'react-router';

import { Button, Modal } from 'antd'
import {ExclamationCircleOutlined} from '@ant-design/icons'

import { allCommodityAtom, totalPriceAtom } from '@/atoms/storeAtoms'
import { studentByIDAtom, classDataAtom } from '@/atoms/studentsAtoms'


import StoreCard from '@/components/StoreCard/StoreCard.tsx'
import BattleConfig from '@/../battleConfig.json'

import './FishStorePage.scss';


export default function FishStorePage() {
    const classJsonData = useAtomValue(classDataAtom)
    const allCommodity = useAtomValue(allCommodityAtom)
    const resetAllCommodity = useResetAtom(allCommodityAtom)
    const totalPrice = useAtomValue(totalPriceAtom)
    const [model, contextHolder] = Modal.useModal()
    const [searchParams] = useSearchParams();
    const navigate = useNavigate()
    const consumerID = Number(searchParams.get('consumer'))
    const [consumer, setConsumer] = useAtom(studentByIDAtom(consumerID))


    const ConfirmContent = () => {
        return (
            <div className='bill-confirm'>
                <p>{consumer && consumer.name}, 你购买的商品如下：</p>
                {Object.values(allCommodity).filter(com => com.amount).map(com => (<p key={com.name}>{com.name} x {com.amount}</p>))}
                <p>注意：点击确认后，商品会自动发送到账户！所有购买的商品均不支持无理由退款！</p>
            </div>
        )
    }

    function handleConfirmBtn() {
        // change consumer assets/deliver goods
        Object.entries(allCommodity).forEach(([id, commodity]) => {
            setConsumer(pre => ({
                ...pre,
                assets: {
                    ...pre.assets,
                    [id]: pre.assets[id] + commodity.amount
                }
            }))
        })
        // update cache
        localStorage.setItem(BattleConfig.cacheControl.classDataAtomCacheKey, JSON.stringify(classJsonData))

        // reset store status
        resetAllCommodity()

        // back to discipline page
        navigate(-1)
    }

    const handleCheckoutBtnClick = () => {
        model.confirm({
            title: '虎氏杂货铺订单确认',
            icon: <ExclamationCircleOutlined />,
            content: <ConfirmContent/>,
            okText: '确认',
            cancelText: '取消',
            onOk: handleConfirmBtn
        })
    }

    return (
        <div className={'fish-store'}>
            <div className={'header'}>
                {consumer && `欢迎你，${consumer.name}!`}
            </div>
            <div className={'showcase'}>
                {Object.entries(allCommodity).map(([id, commodity]) => {
                    return <StoreCard
                        key={id}
                        id={id}
                        commodity={commodity}
                    />
                })}
            </div>
            <div className={'cashier'}>
                <h1>总价: {totalPrice} 鱼干</h1>
                <Button onClick={handleCheckoutBtnClick} className={'checkout-btn'}>支付</Button>
            </div>
            {contextHolder}
        </div>
    )
}