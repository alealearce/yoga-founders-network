"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { CHATBOT } from "@/lib/config/site";
import YFNIcon from "@/components/ui/YFNIcon";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const sessionId = useRef<string>("");
  useEffect(() => {
    if (!sessionId.current) {
      sessionId.current =
        Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
    }
  }, []);

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: CHATBOT.greeting },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          sessionId: sessionId.current,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply ?? "Sorry, something went wrong.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating pill button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label={`Open ${CHATBOT.name} chat`}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-sans font-semibold text-sm text-white shadow-float hover:opacity-90 transition-all duration-300"
          style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
        >
          <YFNIcon letter="L" size="xs" variant="solid" className="bg-white/20 text-white border-0" />
          <span className="hidden sm:block">Ask Lotus</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col bg-surface-card rounded-2xl shadow-[0_8px_40px_rgba(26,28,25,0.14)] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ width: "400px", height: "520px", maxWidth: "calc(100vw - 2rem)" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
          >
            <div className="flex items-center gap-2.5">
              <YFNIcon letter="L" size="sm" variant="solid" className="bg-white/20 text-white border-0" />
              <div>
                <p className="font-sans font-semibold text-sm text-white leading-tight">
                  {CHATBOT.name}
                </p>
                <p className="font-sans text-xs text-white/70 leading-tight">
                  Your yoga guide
                </p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-bg">
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end gap-2">
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base"
                  style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
                >
                  🪷
                </div>
                <div className="bg-surface-low rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full animate-bounce" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={sendMessage} disabled={loading} />
        </div>
      )}
    </>
  );
}
