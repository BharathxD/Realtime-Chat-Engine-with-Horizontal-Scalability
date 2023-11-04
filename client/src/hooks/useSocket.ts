import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { SOCKET_URL } from "@/lib/constants";
import { toast } from "sonner";

/**
 * useSocket is a custom React hook that establishes and manages a WebSocket connection.
 * @returns { Socket | null } A Socket.io client socket instance.
 */
const useSocket = (): Socket | null => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socketClient: Socket = io(SOCKET_URL, {
            reconnection: true,
            upgrade: true,
            transports: ["websocket", "polling"],
        });
        setSocket(socketClient);
        return () => { socketClient.disconnect() }
    }, []);

    return socket;
}

export default useSocket;
