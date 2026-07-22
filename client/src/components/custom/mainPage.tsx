import WorkElement from "@/components/custom/work";
import BottomBar from "./bottomBar";
import VideoCallElement from "@/components/custom/videoCall";
// import Notification from "./components/custom/Notification";
import { useState, useEffect } from "react";
import NavBar from "./navBar";
import { ChevronRightCircle } from "lucide-react";
import axios from "axios";
import { connectSocket } from "@/socket";

const MainPage = () =>{

    const [startUp, setStartUp] = useState<boolean>(true);
    const [showBottomBar, setShowBottomBar] = useState<boolean>(false);
    const [showCall, setShowCall] = useState<boolean>(false);

    useEffect(() => {
        const handleBottomBarToggle = (e: Event) => {
            const customEvent = e as CustomEvent<{ show: boolean }>;
            setShowBottomBar(customEvent.detail.show);
        };
        const handleCallToggle = (e: Event) => {
            const customEvent = e as CustomEvent<{show: boolean}>;
            setShowCall(customEvent.detail.show);
        }
        window.addEventListener('toggle-call', handleCallToggle);
        window.addEventListener('toggle-bottom-bar', handleBottomBarToggle);
        return () => {
            window.removeEventListener('toggle-call', handleCallToggle);
            window.removeEventListener('toggle-bottom-bar', handleBottomBarToggle);
        };
    }, []);

    return(
        <div className="h-screen w-screen overflow-hidden">
            <NavBar/>
            {startUp ?
                <LoadingComponent setStartUp = {setStartUp}/> :
                (
                    <>
                        <WorkElement/> 
                        {showCall && <VideoCallElement/>}
                        {showBottomBar && <BottomBar />}
                    </>
                )
            }
            
        </div>
    )
}

export default MainPage;


const LoadingComponent = ({setStartUp}: {setStartUp: React.Dispatch<React.SetStateAction<boolean>>}) => {

    const [name, setName] = useState<string|null>(null);

    const api = axios.create({
        baseURL: "http://localhost:8080",
        timeout: 5000
    })

    const handleNameSubmit = async () =>{
        try{
            const code = sessionStorage.getItem("roomCode");
            console.log(name);
            console.log(code);
            await api.post("/registerPlayer", {username: name, roomCode: code});
            sessionStorage.setItem("username", name || "");
            setStartUp(false);
            if(code && name){
                connectSocket(name, code);
            }
        }catch(e){
            console.log(e);
        }
    }

    return(
        <div className="relative h-full w-full">
            <img
                src = "/officePic.png"
                className="w-screen h-screen object-cover"
            />
            <div className="absolute z-10 top-1/3 left-1/2 h-60 w-60 -translate-y-1/2 -translate-x-1/9">
                <img
                    src="/dailogBox.png"
                    className="absolute inset-0 object-top h-60 w-60"
                />
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <input
                        placeholder="your name ....."
                        onChange={(e) => { setName(e.target.value) }}
                        className="max-w-43 ml-4 mb-15 focus:outline-none focus:ring-0"
                    />
                    <button onClick={handleNameSubmit} className="cursor-pointer">
                        <ChevronRightCircle/>
                    </button>
                </div>
            </div>
        </div>
    )
}