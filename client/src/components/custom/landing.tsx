import { useState } from 'react'
import {useNavigate} from 'react-router-dom'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

const Landing = () => {

    const [roomId, setRoomId] = useState<string|null>(null) 
    const navigate = useNavigate();

    const handleRoomJoin = () => {
        if(roomId === null){
            alert("enter room id");
        }
        navigate(`/{roomId}`)
    }

    return (
        <div className='h-screen w-screen flex items-center jsutify-center'>
            <div className='flex flex-col gap-2 p-3'>
                <Input onChange={(e) => {setRoomId(e.target.value)}}/>
                <Button className='' variant={"outline"} onClick={handleRoomJoin}>
                    join room
                </Button>
            </div>
        </div>
    )
}

export default Landing