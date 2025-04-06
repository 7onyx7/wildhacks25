import { create } from "zustand";
import { chatWithGemini } from "./useGemini";

interface ChatMessage {
  sender: "user" | "gemini";
  content: string;
  timestamp: string;
}

interface ChatStore {
  sessionId: string;
  messages: ChatMessage[];
  sendMessage: (msg: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessionId: `chat-${Date.now()}`,
  messages: [],
  sendMessage: async (msg: string) => {
    const sessionId = get().sessionId;
    const newUserMsg: ChatMessage = {
      sender: "user",
      content: msg,
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ messages: [...state.messages, newUserMsg] }));

    try {
      const reply = await chatWithGemini(msg, sessionId);
      const newReply: ChatMessage = {
        sender: "gemini",
        content: reply,
        timestamp: new Date().toISOString(),
      };
      set((state) => ({ messages: [...state.messages, newReply] }));
    } catch (error) {
      console.error("Gemini chat error:", error);
    }
  },
}));
