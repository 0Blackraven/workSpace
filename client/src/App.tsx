// import NavBar from "./components/custom/navBar";
import Landing from "./components/custom/landing";
import {BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import MainPage from "./components/custom/mainPage";

export function App() {
  return (
    <div className="h-screen w-screen m-0 p-0 overflow-hidden">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/landing" replace />}/>
          <Route path="/landing" element={<Landing/>}/>
          <Route path="/workspace" element={<MainPage/>}/>
        </Routes>
      </Router>
    </div>
  )
}

export default App
