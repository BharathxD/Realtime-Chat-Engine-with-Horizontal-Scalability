const MESSAGE_TYPE = {
    CONNECTION_COUNT_UPDATED_CHANNEL: "chat:connection-count-updated",
    NEW_MESSAGE_CHANNEL: "chat:new-message"
} as const

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "ws://127.0.0.1";

export {
    MESSAGE_TYPE,
    SOCKET_URL
}