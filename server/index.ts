import Express from "express";
import { Server } from "socket.io";
import cors from "cors";
import { createServer } from "http";
import { createHash } from "crypto";
import { loginSetup } from "./loginSetup.js";
import { createtUser, getUser } from "./db.js"

const port = process.env.PORT || 8080;
const app = Express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    // credentials: true,
}));

    const handleSetup = (username: string, password: string)  =>{
        const hash: string = createHash('sha256').update(password+username).digest("hex");
        
        return hash;
    }

app.use(Express.json());

app.post("/signin", (req, res)=>{
    const {username, password, mode} = req.body;
    
    if(!username || !password || !mode){
        res.status(400).json({error: "missing fields"});
    }

    console.log("username: ", username);
    console.log("password: ", password);
    console.log("mode: ", mode);

    if(mode == "signup"){
        const token = loginSetup.randomSalt();
        const hash = handleSetup(username, password);
        console.log("creating user")
        createtUser(username, hash, token);
        console.log("user created");
    }
    if(mode == "login"){
        getUser(username, password).then((user)=>{
            if(!user){
                console.log("user not found");
                return res.status(401).json({error: "invalid username or password"});
            }
            const hash = handleSetup(username, password);
            if(hash !== user.password){
                console.log(hash)
                console.log("password not found");
                return res.status(401).json({error: "invalid username or password"});
            }
            return res.status(200).json({message: "login successful"});
        }).catch((err)=>{
            console.error(err);
            return res.status(500).json({error: "internal server error"});
        });
    }
});



const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        // credentials: true,
    }
});

io.on("connection_error", (error) => {
    console.error("Connection error:", error);
});

io.on("connection", (socket) => {
    const data: string = "Hello from server";
    socket.emit("connected", data)
});

server.listen(port, ()=>{
    console.log(`Sever connected to port ${port}`)
});

