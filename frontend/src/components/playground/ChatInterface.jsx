// File path: code_tutor2/frontend/src/components/code_playground/ChatInterface.jsx

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import FrontendLogger from "@/services/frontendLogger";

// ChatInterface component for handling user and AI chat interactions
const ChatInterface = () => {
  // State for managing chat messages and user input
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Effect for logging component mount and unmount events
  useEffect(() => {
    FrontendLogger.info("ChatInterface", "Component mounted");
    return () => {
      FrontendLogger.info("ChatInterface", "Component unmounted");
    };
  }, []);

  // Function to handle sending messages and simulating AI responses
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Creating a new message object with user input
    const newMessage = {
      id: Date.now(),
      content: input,
      sender: "user",
    };

    // Logging the user's message
    FrontendLogger.debug("ChatInterface", "User sent a message", { message: input });

    // Updating the state with the new message and clearing the input
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulating an AI response after a delay
    setTimeout(() => {
      const aiResponse = "I'm here to help you with your code!";
      // Updating the state with the AI's response
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: aiResponse,
          sender: "ai",
        },
      ]);
      // Logging the AI's response
      FrontendLogger.debug("ChatInterface", "AI response received", { response: aiResponse });
    }, 1000);
  };

  // JSX for rendering the chat interface
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
