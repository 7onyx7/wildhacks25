import { create } from "zustand";
import { chatWithGemini } from "@/hooks/useGemini";

interface Message {
  sender: "user" | "gemini";
  content: string;
  timestamp: string;
}

interface ChatStore {
  sessionId: string;
  messages: Message[];
  sendMessage: (msg: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessionId: "chat-" + Date.now(),
  messages: [],
  sendMessage: async (msg: string) => {
    const sessionId = get().sessionId;
    const userMessage: Message = {
      sender: "user",
      content: msg,
      timestamp: new Date().toISOString(),
    };

    set((state) => ({ messages: [...state.messages, userMessage] }));

    try {
      const reply = await chatWithGemini(msg, sessionId);
      const geminiReply: Message = {
        sender: "gemini",
        content: reply,
        timestamp: new Date().toISOString(),
      };

      set((state) => ({ messages: [...state.messages, geminiReply] }));
    } catch (error) {
      console.error("Chat error:", error);
    }
  },
}));
