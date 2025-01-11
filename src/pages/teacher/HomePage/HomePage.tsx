import { useNavigate } from "react-router"

import './HomePage.scss';

export default function HomePage() {
    const navigate = useNavigate()
    return (
        <>
            <div className={"homepage"}>
                <div
                    onClick={() => {
                        navigate('/battle')
                    }}
                    className={"lesson"}>上课</div>
                <div className={"grade"}>批改</div>
                <div className={"preparation"}>备课</div>
                <div className={"qna"}>答疑</div>
                <div className={"stu-manage"}>学生管理</div>
            </div>
        </>
                )
}