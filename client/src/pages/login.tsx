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
    const [usernameOrEmail, setUsernameOrEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmation, setConfirmation] = useState<string>("");
    const [usernameOrEmailError, setUsernameOrEmailError] = useState<boolean>(true);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    const matchPasswordStatus = password != " " && password === confirmation;
    const matchUsernameOrEmailStatus = emailRegex.test(usernameOrEmail) || usernameRegex.test(usernameOrEmail);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    }
    const handleConfirmationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmation(e.target.value);
    }
    const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsernameOrEmail(e.target.value);
    }
    
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>, mode: string, matchUsernameOrEmailStatus:boolean) =>{
        if(!matchUsernameOrEmailStatus){
            setUsernameOrEmailError(false);
            return;
        }
        setUsernameOrEmailError(true);
        try{
            e.preventDefault();
            const res = await axios.post("http://localhost:8080/signin",
                {
                    usernameOrEmail: usernameOrEmail,
                    password: password,
                    mode: mode
                },
            );  
            alert(res.data.message)
        }catch(err: any){
             if (err.response && err.response.data) {
            // Show the backend's error message
            alert(err.response.data.error || "An error occurred");
        } else {
            console.error(err);
            alert("something went wrong i dont know what but something went wrong");
    }
        }
    }

    return(
        <div className="flex h-screen w-screen items-center justify-center">
            <Tabs defaultValue="Login" className="w-[400px]" >
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="Login" onClick={()=>{setUsernameOrEmailError(true)}}>LOGIN</TabsTrigger>
                <TabsTrigger value="SignUp" onClick={()=>{setUsernameOrEmailError(true)}}>SIGNUP</TabsTrigger>
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
                    {!usernameOrEmailError && <div className="text-red-500 flex justify-center">Username or Email is not valid</div>}
                </CardContent>
                <CardFooter>
                    <Button onClick={(e)=>handleSubmit(e, "login", matchUsernameOrEmailStatus)}>Submit</Button>
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
                    {!matchPasswordStatus && <div className="text-red-500 flex justify-center">Password and Confirm Password do not match</div>}
                    {!usernameOrEmailError && <div className="text-red-500 flex justify-center">Username or Email is not valid</div>}
                </CardContent>
                <CardFooter>
                    <Button disabled={(!matchPasswordStatus && !matchUsernameOrEmailStatus)} onClick={(e)=>handleSubmit(e, "signup", matchUsernameOrEmailStatus)}>
                        Start
                    </Button>
                </CardFooter>
                </Card>
            </TabsContent>
            </Tabs>
        </div>
    )
}