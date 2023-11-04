import * as z from "zod";

const MessageSchema = z.object({
    message: z.string().min(2, {
        message: "Please enter a valid text"
    }),
});

type MessageType = z.infer<typeof MessageSchema>;

export {
    MessageSchema
};

export type {
    MessageType
};