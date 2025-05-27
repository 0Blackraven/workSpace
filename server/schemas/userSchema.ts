import pool from "../db/index.js";
import jwt from "jsonwebtoken";

export interface Users {
    id: number;
    username: string;
    email: string;
    password: string;
    name?: string;
    refreshToken?: string;
    accessToken?: string;
}

export const createAccessToken = (username: string):string =>{
    const accessToken = jwt.sign(
        { username },
        process.env.ACCESS_TOKEN_SECRET || "myFirstBigProject",
        { expiresIn: "1d"});
    return accessToken;
}

export const createRefreshToken = (username:string):string =>{
    const refreshToken = jwt.sign(
        { username },
        process.env.REFRESH_TOKEN_SECRET || "myFirstBigProject",
        {
            expiresIn: "4d"
        }
    );
    return refreshToken;
}

export const checkUsernameOrEmailAvailability = async (username:string,isEmailChecker:boolean):Promise<boolean> =>{
    try{
        if(!isEmailChecker){
            const usernameOrEmailAvailability = ((await pool.query("SELECT username FROM users WHERE username = $1", [username])).rowCount == 0);
            return usernameOrEmailAvailability;
        }else{
           const usernameOrEmailAvailability = ((await pool.query("SELECT email FROM users WHERE email = $1", [username])).rowCount == 0);
           return usernameOrEmailAvailability;
        }
    }catch(err){
        console.error("error in databse fetch i guess")
        return false; 
    }
}

export const registerUser = async ( password: string, usernameOrEmail:string, isEmailChecker:boolean) => {
    try{
        if(!isEmailChecker){
            const res= await pool.query("INSERT INTO users (password, username) VALUES ($1, $2) RETURNING * ",[password, usernameOrEmail]);
            console.log( res.rows[0]);
        }else{
            const res= await pool.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING * ", [usernameOrEmail, password]);
            console.log( res.rows[0]);
        }
    } catch(err){
        console.error("Error creating user: ", err);
    }
};

export const getUser = async (usernameOrEmail:string, password:string, isEmailChecker:boolean) => {
    try{
        if(!isEmailChecker){
            const res = await pool.query("SELECT * FROM users WHERE username = $1", [usernameOrEmail]);
            console.log("user: ", res.rows[0]);
            return res.rows[0];
        }else{
            const res = await pool.query("SELECT * FROM users WHERE email = $1", [usernameOrEmail]);
            console.log("user: ", res.rows[0]);
            return res.rows[0];
        }
    }catch(err){
        throw new Error("Error getting user: " + err);
    }
};
