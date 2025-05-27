import { createHash } from "crypto";
import {app} from "./index.js";
import { Request,Response } from "express";
import { 
    registerUser, 
    getUser,
    createAccessToken, 
    createRefreshToken,
    Users,
    checkUsernameOrEmailAvailability} from "./schemas/userSchema.js"


const secretKey: string = process.env.SECRET || "mysecretkey";

const createHashForPassword = (password: string)  =>{
        const hash: string = createHash('sha256').update(password+secretKey).digest("hex");
        
        return hash;
}
const isEmail =(email: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}
const setTokens = (username:string):[string,string] =>{
    let accessToken = createAccessToken(username);
    let refreshToken = createRefreshToken(username);
    return [accessToken, refreshToken];
}


export const  LoginSetup = async (req:Request, res:Response)=>{
    
    const {usernameOrEmail, password, mode}:{usernameOrEmail:string, password: string, mode: "login"|"signup"} = req.body as {usernameOrEmail: string, password: string, mode: "login"|"signup"};

    const isEmailChecker = isEmail(usernameOrEmail);
    
    // all the console checks 
    console.log("username: ", usernameOrEmail);
    console.log("password: ", password);
    console.log("mode: ", mode);
    console.log("isEmail: ", isEmailChecker);
    
    if(!usernameOrEmail || !password || !mode){
        res.status(400).json({error: "All fields are required"});
        return;
    }
    
    if(mode == "signup"){
        const isUsernameOrEmailAvailable = await checkUsernameOrEmailAvailability(usernameOrEmail, isEmailChecker);
        console.log("isUsernameOrEmailAvailable: ", !isUsernameOrEmailAvailable);
        if(!isUsernameOrEmailAvailable){
            console.log("username or email already exists");
            res.status(409).json({error: "username or email already exists"});
            return;
        }
        try{
            const hash = createHashForPassword(password);
            console.log("creating user");
            registerUser(hash, usernameOrEmail, isEmailChecker);
            const [accessToken, refreshToken]:[string,string] = setTokens(usernameOrEmail);
            res.cookie("accessToken", accessToken,{
                httpOnly: true,
                secure: true,
            });
            res.cookie("refreshToken", refreshToken,{
                httpOnly: true,
                secure: true,
            });
            res.status(201).json({message: "user created"});
        }catch(err){
            console.error("Error creating user: ", err);
            res.status(500).json({error: "internal server error"});
        }
    }
    if(mode == "login"){
        getUser(usernameOrEmail, password, isEmailChecker).then((user)=>{
            if(!user){
                console.log("user not found");
                return res.status(401).json({error: "invalid username or password"});
            }
            const hash = createHashForPassword(password);
            if(hash !== user.password){
                console.log(hash)
                console.log("password not found");
                return res.status(401).json({error: "invalid username or password"});
            }
            const [accessToken, refreshToken]:[string,string] = setTokens(usernameOrEmail);
            res.cookie("accessToken", accessToken,{
                httpOnly: true,
                secure: true,
            });
            res.cookie("refreshToken", refreshToken,{
                httpOnly: true,
                secure: true,
            });
            return res.status(200).json({message: "login successful"});
        }).catch((err)=>{
            console.error(err);
            return res.status(500).json({error: "internal server error"});
        });
    }
    if(mode !== "login" && mode !== "signup"){
        console.log("invalid mode");
        res.status(400).json({error: "sorry something went wrong(mode) "});
    }
}; 