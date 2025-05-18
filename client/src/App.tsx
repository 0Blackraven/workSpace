import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Landing from './pages/landing'
import MyPage from './pages/myPage'
import Game from './pages/game'
import Home from './pages/home'
import Login from './pages/login'
import './App.css'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<Landing/>} />
          <Route path='/signin' element={<Login/>}/>
          <Route path ='/home' element={<Home/>} />
          <Route path='/myPage/id' element={<MyPage/>} />
          <Route path='/:game' element={<Game/>} />
        </Routes>
      </Router>
    </>
  )
}

export default App
