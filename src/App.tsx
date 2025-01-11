import {Routes, Route} from 'react-router';
import { enableMapSet } from 'immer'

import './App.css'
import BattlePage from './pages/teacher/BattlePage/BattlePage.tsx'
import HomePage from './pages/teacher/HomePage/HomePage.tsx'
import StudentHomePage from '@/pages/student/StudentHomePage/StudentHomePage.tsx'
import {StudentProfilePage} from '@/pages/student/StudentProfilePage/ProfilePage.tsx';
import SkillShopPage from '@/pages/student/ShopPage/SkillShopPage.tsx'

enableMapSet()
function App() {
  return (
    <>
        <Routes>
            <Route path={"/"} element={<HomePage/>}/>
            <Route path={"/battle"} element={<BattlePage/>}/>
            <Route path={"/law"} element={<BattlePage/>}/>
            <Route path={"/student"}>
                <Route path={''} element={<StudentHomePage/>}/>
                <Route path={'profile'} element={<StudentProfilePage/>}/>
                <Route path={'shop'} element={<SkillShopPage/>}/>
            </Route>
        </Routes>
    </>
  )
}

export default App
