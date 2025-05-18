import {Pool} from "pg";

const pool = new Pool({
    user: 'postgres',
    password: 'password',
    host: 'localhost',
    port: 5432,
    database: 'workspacedb',
});

export async function createtUser(username: string, password: string, token: string ){
    try{
        const res= await pool.query("INSERT INTO users (username, password, token) VALUES ($1, $2, $3) RETURNING * ", [username, password, token]);
        console.log( res.rows[0]);
    } catch(err){
        console.error("Error creating user: ", err);
    }
}

export async function getUser(username: string, password: string){
    try{
        const res = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        console.log("user: ", res.rows[0]);
        return res.rows[0];
    } catch(err){
        console.error("Error getting user: ", err);
    }
}