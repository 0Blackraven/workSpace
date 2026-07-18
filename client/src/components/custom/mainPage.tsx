import WorkElement from "@/components/custom/work";
// import BottomBar from "./components/custom/bottomBar";
// import VideoCallElement from "./components/custom/videoCall";
// import Notification from "./components/custom/Notification";
import { useState } from "react";
import NavBar from "./navBar";
import { ChevronRightCircle } from "lucide-react";
import axios from "axios";

const MainPage = () =>{

    const [startUp, setStartUp] = useState<boolean>(true);

    return(
        <div className="h-screen w-screen overflow-hidden">
            <NavBar/>
            {startUp ?
                <LoadingComponent setStartUp = {setStartUp}/> :
                <WorkElement/>
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