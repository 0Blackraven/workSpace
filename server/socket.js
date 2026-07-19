import { Server } from "socket.io";
import {} from "http";
import { activeRooms } from "./index.js";
export const initSocketServer = (server) => {
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });
    io.on("connection", (socket) => {
        const roomCode = socket.handshake.query.roomCode;
        const username = socket.handshake.query.username;
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
            console.log(`Connection rejected: Please try login again`);
            return socket.disconnect(true);
        }
        player.socket = socket.id;
        socket.join(roomCode);
        console.log(`Socket mapped: ${username} is linked to socket ID: ${socket.id}`);
        socket.to(roomCode).emit("player-spawned", { username });
        socket.on('send-player-load', () => {
            const existingPlayers = room.players.filter(p => p.socket !== socket.id && p.socket !== "");
            existingPlayers.forEach(p => {
                socket.emit("initial-player-load", {
                    x: p.x,
                    y: p.y,
                    anim: p.anim,
                    isMoving: p.isMoving,
                    socketId: p.socket,
                    username: p.username
                });
            });
        });
        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id} (username: ${username})`);
            const currentRoom = activeRooms.get(roomCode);
            if (currentRoom) {
                // Remove player from the room list
                currentRoom.players = currentRoom.players.filter(p => p.socket !== socket.id);
                // Notify other clients in the room
                socket.to(roomCode).emit("other-player-disconnected", socket.id);
                if (currentRoom.players.length === 0) {
                    activeRooms.delete(roomCode);
                    console.log(`Room ${roomCode} is now empty and has been removed.`);
                }
            }
        });
        handleRequests(socket, roomCode, username);
    });
};
function handleRequests(socket, roomCode, username) {
    socket.on("player-movement", (data) => {
        const room = activeRooms.get(roomCode);
        if (room) {
            const player = room.players.find(p => p.socket === socket.id);
            if (player) {
                player.x = data.x;
                player.y = data.y;
                player.anim = data.anim;
                player.isMoving = data.isMoving;
            }
        }
        socket.to(roomCode).emit("other-player-movement", {
            ...data,
            socketId: socket.id,
            username
        });
    });
}
//# sourceMappingURL=socket.js.map