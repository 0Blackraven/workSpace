import { Socket } from '../../socket';
import { useEffect, useState } from 'react';

export default function Landing() {

    const [data, setData] = useState<string>("");

    useEffect(() => {
        Socket.on("connected", (data: string) => {
            setData(data);
        });
    },[data]);
    
    return(
        <div>
            {data}
        </div>
    ) 
}