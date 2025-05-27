import Express from "express";
import { Server } from "socket.io";
import cors from "cors";
import { createServer } from "http";
import cookieParser from "cookie-parser";
import userAuthRouter from "./routes/userAuthRoutes.js";

const port = process.env.PORT || 8080;
const app = Express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}));
app.use(Express.json());
app.use(cookieParser());

app.use("/", userAuthRouter)

const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
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

export { io, app };