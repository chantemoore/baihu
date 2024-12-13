import {Routes, Route} from 'react-router';
import { enableMapSet } from 'immer'

import './App.css'
import BattlePage from './pages/BattlePage/BattlePage.tsx'
import HomePage from './pages/HomePage/HomePage.tsx'


enableMapSet()
function App() {
  return (
    <>
        <Routes>
            <Route path={"/"} element={<HomePage/>}/>
            <Route path={"/battle"} element={<BattlePage/>}/>
        </Routes>
    </>
  )
}

export default App
