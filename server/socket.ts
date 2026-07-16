import { Server, type Socket } from "socket.io";
import { type Server as HTTPServer } from "http";
import { activeRooms } from "./index.js";

export const initSocketServer = (server: HTTPServer) => {
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });

    io.on("connection", (socket: Socket) => {
        const { roomCode, username } = socket.handshake.auth;

        if (!roomCode || !username) {
            console.log("Connection rejected: Missing query parameters.");
            return socket.disconnect(true);
        }

        const room = activeRooms.get(roomCode);
        if (!room) {
            console.log(`Connection rejected: Room ${roomCode} doesn't exist.`);
            return socket.disconnect(true);
        }

        const player = room.players.find((p) => p.username === username);
        if (!player) {
            console.log(`Connection rejected: Player ${username} hasn't hit HTTP validation route.`);
            return socket.disconnect(true);
        }

        player.socket = socket.id;

        socket.join(roomCode);
        console.log(`Socket mapped: ${username} is linked to socket ID: ${socket.id}`);

        socket.to(roomCode).emit("player-spawned", { username});

        handleRequests(socket, roomCode, username);
    });
};

function handleRequests(socket: Socket, roomCode: string, username: string) {
    
}