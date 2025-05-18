import { useState, useEffect } from "react";
import  axios  from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
 } from "../components/ui/tabs";
import { 
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle, 
} from "../components/ui/card";

export default function Login(){
    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmation, setConfirmation] = useState<string>("");

    const matchStatus = password != " " && password === confirmation 

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }
    const handleConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmation(e.target.value);
    }
    const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserName(e.target.value);
    }
    
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>, mode: string) =>{
        try{
            e.preventDefault();
            const res = await axios.post("http://localhost:8080/signin",
                {
                    username: userName,
                    password: password,
                    mode: mode
                },
            );
            alert(res.data.message)
        }catch(err: any){
            console.error(err.res?.data.error || "something went wrong i dont know what but something went wrong");
        }
    }

    return(
        <div className="flex h-screen w-screen items-center justify-center">
            <Tabs defaultValue="Login" className="w-[400px]" >
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="Login">LOGIN</TabsTrigger>
                <TabsTrigger value="SignUp">SIGNUP</TabsTrigger>
            </TabsList >
            <TabsContent value="Login">
                
                <Card>
                <CardHeader>
                    <CardTitle>LOGIN</CardTitle>
                    <CardDescription>
                       Welcome Back! 
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="space-y-1">
                    <Label htmlFor="username">UserName</Label>
                    <Input id="username" placeholder="blackraven" onChange={handleUserNameChange}/>
                    </div>
                    <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" placeholder="Qwerty123@" onChange={handlePasswordChange}/>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={(e)=>handleSubmit(e, "login")}>Submit</Button>
                </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="SignUp">
                <Card>
                <CardHeader>
                    <CardTitle>SIGNUP</CardTitle>
                    <CardDescription>
                        Start your journey with us!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="space-y-1">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" placeholder="blackraven" onChange={handleUserNameChange}/>
                    </div>
                    <div className="space-y-1">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" onChange={handlePasswordChange}/>
                    </div>
                    <div className="space-y-1">
                    <Label htmlFor="confirmation">Confirm Password</Label>
                    <Input id="confirmation" type="password" onChange={handleConfirmationChange}/>
                    </div>
                    {!matchStatus && <div>Password and Confirm Password do not match</div>}
                </CardContent>
                <CardFooter>
                    <Button disabled={!matchStatus} onClick={(e)=>handleSubmit(e, "signup")}>
                        Start
                    </Button>
                </CardFooter>
                </Card>
            </TabsContent>
            </Tabs>
        </div>
    )
}