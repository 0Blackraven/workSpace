import express from "express";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import {Server} from "socket.io";
import { createServer } from "http";
import cors from "cors";
import { initSocketServer } from "./socket.js";
import { handleMedia } from "./sfu.js";

dotenv.config();

export interface Player {
    username: string;
    socket: string;
    x: number;
    y: number;
    anim: string,
    isMoving: boolean
}

export interface Room {
    roomCode: string;
    players: Player[];
}

export const activeRooms: Map<string, Room> = new Map();

const corsConfig = {
    origin: "*",
    methods: ["GET", "POST"]
};

const app = express();
app.use(cors(corsConfig));
app.use(express.json());

const port = process.env.PORT || "8080";

const server = createServer(app);

export const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const peer = io.of("/mediasoup");

initSocketServer(io);
handleMedia(peer);

app.route("/verifyRoom").post(handleVerifyRoom);
app.route("/registerPlayer").post(handleRegisterPlayer);
app.route("/createRoom").get(handleCreateConnection);

function handleVerifyRoom(req: Request, res: Response) {
    const { roomCode }: { roomCode: string } = req.body;

    if (!roomCode) {
        return res.status(400).json({ error: "RoomCode not provided" });
    }

    const room = activeRooms.get(roomCode);
    if (!room) {
        return res.status(404).json({ error: "This room code does not exist" });
    }

    return res.status(200).json({ message: "Room valid" });
}

function handleRegisterPlayer(req: Request, res: Response) {
    const { username, roomCode }: { username: string; roomCode: string } = req.body;

    if (!username || !roomCode) {
        return res.status(400).json({ error: "Missing username or roomCode" });
    }

    const room = activeRooms.get(roomCode);
    if (!room) {
        return res.status(404).json({ error: "Room disappeared or timed out" });
    }

    const isUsernameTaken = room.players.some((p) => p.username.toLowerCase() === username.toLowerCase());
    if (isUsernameTaken) {
        return res.status(409).json({ error: "Username is already taken inside this room" });
    }

    const player: Player = { username, x: 0, y: 0, anim: 'down', isMoving: false, socket: "" };
    room.players.push(player);
    
    return res.status(200).json({message: "Ok Verified"});
}

function handleCreateConnection(req: Request, res: Response) {
    const code = createRandomRoomCode();
    
    const room: Room = {
        roomCode: code,
        players: [] 
    };

    activeRooms.set(code, room);
    console.log(activeRooms.get(code) + ": is created\n ");
    return res.status(200).json({ roomCode: code });
}

function createRandomRoomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    do {
        code = '';
        for (let i = 0; i < 6; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
    } while (activeRooms.has(code));
    return code;
}

server.listen(port, () => {
    console.log("Server listening on port: " + port);
});