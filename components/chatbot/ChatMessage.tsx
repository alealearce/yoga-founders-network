"use client";

interface Props {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: Props) {
  const isUser = role === "user";

  return (
    <div
      className={`flex items-end gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {/* Lotus avatar — only for assistant */}
      {!isUser && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-base"
          style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}>
          🪷
        </div>
      )}

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 font-sans text-sm leading-relaxed ${
          isUser
            ? "text-white rounded-br-sm"
            : "bg-surface-low text-on-surface rounded-bl-sm"
        }`}
        style={
          isUser
            ? { background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }
            : undefined
        }
      >
        {content}
      </div>
    </div>
  );
}
