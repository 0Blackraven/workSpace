import express from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import cors from "cors";
import { initSocketServer } from "./socket.js";
dotenv.config();
export const activeRooms = new Map();
const corsConfig = {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
};
const app = express();
app.use(cors(corsConfig));
app.use(express.json());
const port = process.env.PORT || "8080";
const server = createServer(app);
initSocketServer(server);
app.route("/verifyRoom").post(handleVerifyRoom);
app.route("/registerPlayer").post(handleRegisterPlayer);
app.route("/createRoom").get(handleCreateConnection);
function handleVerifyRoom(req, res) {
    const { roomCode } = req.body;
    if (!roomCode) {
        return res.status(400).json({ error: "RoomCode not provided" });
    }
    const room = activeRooms.get(roomCode);
    if (!room) {
        return res.status(404).json({ error: "This room code does not exist" });
    }
    return res.status(200).json({ message: "Room valid" });
}
function handleRegisterPlayer(req, res) {
    const { username, roomCode } = req.body;
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
    const player = { username, x: 0, y: 0, anim: 'down', isMoving: false, socket: "" };
    room.players.push(player);
    return res.status(200).json({ message: "Ok Verified" });
}
function handleCreateConnection(req, res) {
    const code = createRandomRoomCode();
    const room = {
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
//# sourceMappingURL=index.js.map