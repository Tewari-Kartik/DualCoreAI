import type { Message } from "../../types"
import SourceCard from "./SourceCard"

export default function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm ${
        isUser 
          ? "bg-violet-600 text-white" 
          : "bg-zinc-900 text-zinc-100 border border-zinc-800"
      }`}>
        {/* The main message text */}
        <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
          {message.content}
        </div>

        {/* The Source Cards (Only shows up if the AI used documents) */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 font-semibold">
              Sources Retrieved
            </span>
            <div className="grid grid-cols-1 gap-2">
              {message.sources.map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}