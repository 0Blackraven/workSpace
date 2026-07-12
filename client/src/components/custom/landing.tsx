import { useState } from 'react'
import {useNavigate} from 'react-router-dom'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const Landing = () => {

    const [roomId, setRoomId] = useState<string|null>(null);
    const [name, setName] = useState<string|null>(null);
    const navigate = useNavigate();

    const handleRoomJoin = () => {
        if(roomId === null){
            alert("enter room id");
        }
        if(name === null){
            alert("enter room id");
        }
        navigate(`/{roomId}`)
    }

    return (
        <div className='h-screen w-screen flex items-center jsutify-center'>
            <div className='flex flex-col gap-2 p-3'>
                <div className="">
                    <Input onChange={(e) => {setRoomId(e.target.value)}} placeholder='Enter your Room Id'/>
                    <Input onChange={(e) => {setName(e.target.value)}} placeholder='Enter username'/>
                </div>
                <Button className='' variant={"outline"} onClick={handleRoomJoin}>
                    <span className="capitalize">join room</span>
                </Button>
            </div>
        </div>
    )
}

export default Landing