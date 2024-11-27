// File path: code_tutor2/frontend/src/components/code_playground/ChatInterface.jsx

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import FrontendLogger from "@/services/frontendLogger";

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    FrontendLogger.info("ChatInterface", "Component mounted");
    return () => {
      FrontendLogger.info("ChatInterface", "Component unmounted");
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      content: input,
      sender: "user",
    };

    FrontendLogger.debug("ChatInterface", "User sent a message", { message: input });

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = "I'm here to help you with your code!";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: aiResponse,
          sender: "ai",
        },
      ]);
      FrontendLogger.debug("ChatInterface", "AI response received", { response: aiResponse });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <form onSubmit={sendMessage} className="border-t p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Posez votre question..."
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
