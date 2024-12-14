import {Routes, Route} from 'react-router';
import { enableMapSet } from 'immer'

import './App.css'
import BattlePage from './pages/teacher/BattlePage/BattlePage.tsx'
import HomePage from './pages/teacher/HomePage/HomePage.tsx'


enableMapSet()
function App() {
  return (
    <>
        <Routes>
            <Route path={"/"} element={<HomePage/>}/>
            <Route path={"/battle"} element={<BattlePage/>}/>
            <Route path={"/student"}>

            </Route>
        </Routes>
    </>
  )
}

export default App
