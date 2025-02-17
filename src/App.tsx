import {Routes, Route} from 'react-router';
import { enableMapSet } from 'immer'


import './App.css'
import BattlePage from './pages/teacher/BattlePage/BattlePage.tsx'
import HomePage from './pages/teacher/HomePage/HomePage.tsx'
import DisciplinePage from './pages/teacher/DisciplinePage/DisciplinePage.tsx'
import FishStorePage from '@/pages/FishStorePage/FishStorePage.tsx'
import SurpriseBoxPage from '@/pages/SurpriseBoxPage/SurpriseBoxPage.tsx'

enableMapSet()
function App() {
  return (
    <>
        <Routes>
            <Route path={"/"} element={<HomePage/>}/>
            <Route path={"/battle"} element={<BattlePage/>}/>
            <Route path={"/law"} element={<DisciplinePage/>}/>
            <Route path={"/store"} element={<FishStorePage/>}/>
            <Route path={"/surprise"} element={<SurpriseBoxPage/>}/>
            <Route path={"/student"}>
            </Route>
        </Routes>
    </>
  )
}

export default App
