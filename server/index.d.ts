export interface Player {
    username: string;
    socket: string;
    x: number;
    y: number;
    anim: string;
    isMoving: boolean;
}
export interface Room {
    roomCode: string;
    players: Player[];
}
export declare const activeRooms: Map<string, Room>;
//# sourceMappingURL=index.d.ts.map