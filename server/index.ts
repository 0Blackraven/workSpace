import express from "express";
import dotenv from "dotenv";
import type { Request, Response } from "express";
import { createServer } from "http";
import { initSocketServer } from "./socket.js";

dotenv.config();

export interface Player {
    username: string;
    socket: string;
    x: number;
    y: number;
}

export interface Room {
    roomCode: string;
    players: Player[];
}

export const activeRooms: Map<string, Room> = new Map();

const app = express();
app.use(express.json());

const port = process.env.PORT || "8080";

const server = createServer(app);

initSocketServer(server);

app.route("/joinRoom").post(handleJoinConnection);
app.route("/createRoom").post(handleCreateConnection);

function handleJoinConnection(req: Request, res: Response) {
    const { username, roomCode }: { username: string; roomCode: string } = req.body;

    if (!username || !roomCode) {
        return res.status(400).json({ error: "Missing username or roomCode" });
    }

    const room = activeRooms.get(roomCode);
    if (!room) {
        return res.status(404).json({ error: "Room does not exist" });
    }

    const isUsernameTaken = room.players.some((p) => p.username === username);
    if (isUsernameTaken) {
        return res.status(409).json({ error: "Username already taken" });
    }

    const player: Player = { username, x: 0, y: 0, socket: "" };
    room.players.push(player);
    
    return res.status(200).json({ roomCode, username });
}

function handleCreateConnection(req: Request, res: Response) {
    const { username }: { username: string } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username not provided" });
    }

    const code = createRandomRoomCode();
    const player: Player = { username, x: 0, y: 0, socket: "" };
    
    const room: Room = {
        roomCode: code,
        players: [player]
    };

    activeRooms.set(code, room);
    return res.status(200).json({ roomCode: code, username });
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