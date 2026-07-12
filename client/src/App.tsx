import WorkElement from "@/components/custom/work";
import BottomBar from "./components/custom/bottomBar";
import VideoCallElement from "./components/custom/videoCall";
import Notification from "./components/custom/Notification";
import NavBar from "./components/custom/navBar";

export function App() {
  return (
    <div className="h-screen w-screen m-0 p-0 overflow-hidden">
      <NavBar/>
      <WorkElement/>
      {/* <Notification/> */}
      {/* <VideoCallElement/>
      <BottomBar /> */}
    </div>
  )
}

export default App
