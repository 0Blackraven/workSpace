import { io } from "socket.io-client";

export const socket = io("http://localhost:8080" , {
    transports: ['websocket'],
    autoConnect: false
});

export const mediaSocket = io("http://localhost:8080/mediasoup", {
    autoConnect: false
});

export const connectSocket = (username: string, roomCode: string) => {
    if (socket.connected) {
        return;
    }
    socket.io.opts.query = { username, roomCode };
    socket.connect();
    socket.on("connect", () => {
        console.log(socket + " joined\n ");
    });

    socket.on("disconnect", (reason) => {
        console.log("Disconnected from server:", reason);
    })
}
