"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MESSAGE_TYPE } from "@/lib/constants";
import { Message } from "@/lib/types";
import { MessageSchema, MessageType } from "@/lib/validations/message";
import useSocket from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const HomePage = () => {
  const form = useForm<MessageType>({
    resolver: zodResolver(MessageSchema),
    defaultValues: {
      message: "",
    },
  });
  const messageListRef = useRef<HTMLOListElement | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionCount, setConnectionCount] = useState(0);
  const socket = useSocket();

  const scrollToBottom = () => {
    if (!messageListRef.current) return;
    messageListRef.current.scrollTop = messageListRef.current.scrollHeight + 1000;
  };

  const sendMessage = (data: MessageType) => {
    socket?.emit(MESSAGE_TYPE.NEW_MESSAGE_CHANNEL, {
      message: data.message,
    });
    form.setValue("message", "");
  };

  useEffect(() => {
    socket?.on("connect", () => toast.success("Connected to the socket"));

    socket?.on(MESSAGE_TYPE.NEW_MESSAGE_CHANNEL, (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      setTimeout(() => scrollToBottom(), 0);
    });

    socket?.on(MESSAGE_TYPE.CONNECTION_COUNT_UPDATED_CHANNEL, ({ count }: { count: number }) =>
      setConnectionCount(count)
    );
  }, [socket]);

  return (
    <main className="m-auto flex min-h-screen w-full max-w-3xl flex-col p-4">
      <div className="justify-center flex flex-col items-center gap-2">
        <h1 className="text-center text-2xl font-semibold">Horizontally Scalable Chat Application</h1>
        <p className="font-semibold text-neutral-500"> ({connectionCount}) Connected Clients</p>
      </div>
      <ol className="flex-1 overflow-x-hidden overflow-y-scroll" ref={messageListRef}>
        {messages.map((m) => {
          return (
            <li className="my-2 break-all rounded-lg bg-gray-100 p-4" key={m.id}>
              <p className="text-small text-gray-500">{m.createdAt}</p>
              <p className="text-small text-gray-500">{m.port}</p>
              <p>{m.message}</p>
            </li>
          );
        })}
      </ol>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(sendMessage)}
          className="flex flex-col items-center justify-center gap-2">
          <div className="flex w-full flex-row items-start justify-center gap-4 py-2">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input className="w-full min-w-[300px] md:min-w-[600px]" placeholder="Message" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Send</Button>
          </div>
          <FormDescription>Your message will be broadcasted to everyone in the room</FormDescription>
        </form>
      </Form>
    </main>
  );
};

export default HomePage;
