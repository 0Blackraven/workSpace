import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios";
import { Clipboard, ClipboardCheck } from 'lucide-react';

const Landing = () => {

    const [roomId, setRoomId] = useState<string | null>(null);
    const [showCode, setShowCode] = useState<boolean>(false);
    const [isClicked, setIsClicked] = useState<boolean>(false);
    const navigate = useNavigate();

    const api = axios.create({
        baseURL: "http://localhost:8080",
        timeout: 5000
    });

    const handleRoomJoin = async () => {
        if (roomId === null) {
            alert("enter room id");
        }
        try {
            await api.post("/verifyRoom", { roomCode: roomId });
            sessionStorage.setItem("roomCode", roomId || "");
            navigate("/workspace");
        } catch (e) {
            console.log(e);
        }
    }

    const handleRoomCreate = async () => {
        try {
            const res = await api.get("/createRoom");
            const code = res.data.roomCode
            setRoomId(code);
            setShowCode(true);
            sessionStorage.setItem("roomCode", code);
        } catch (e) {
            console.log(e);
        }
    }

    const handleCopyCode = () => {
        if(!roomId){
                alert("Please refresh");
                return;
            }
        navigator.clipboard.writeText(roomId);
        setIsClicked(true);
            
        setTimeout(()=>{
            setIsClicked(false);
        },1000*10);
    }

    return (
        <div className='h-screen w-screen flex items-center justify-center'>
            {
                showCode ?
                    (<div className='flex flex-col gap-2 p-3'>
                        <div className='border-2 p-3 min-w-xl grid grid-cols-[6fr_1fr]'>
                            <div className='w-full h-full flex justify-center items-center p-2 border-r-2'>
                                <span>{roomId}</span>
                            </div>
                            <button className='h-full w-full flex justify-center cursor-pointer' onClick={handleCopyCode}>
                                {
                                    isClicked ?
                                    (<div>
                                        <ClipboardCheck/>
                                    </div>) :
                                    (<div>
                                        <Clipboard/>
                                    </div>)
                                }
                            </button>   
                        </div>
                        <div className='flex justify-center'>
                            <button className='border-2 p-3 rounded-lg' onClick={()=>{navigate('/workspace')}}>
                                <span className="capitalize">join room</span>
                            </button>
                        </div>
                    </div>) :
                    (<div className='flex flex-col gap-2 p-3'>
                        <div className="">
                            <input
                                onChange={(e) => { setRoomId(e.target.value) }}
                                placeholder='Enter your Room Id'
                                className='border-2 p-3 min-w-xl'
                            />
                        </div>
                        <div className='flex gap-2'>
                            <button className='border-2 p-3 rounded-lg' onClick={handleRoomJoin}>
                                <span className="capitalize">join room</span>
                            </button>
                            <button className='border-2 p-3 rounded-lg' onClick={handleRoomCreate}>
                                <span className="capitalize">create room</span>
                            </button>
                        </div>
                    </div>)
            }
        </div>
    )
}

export default Landing