"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  sender: "system" | "user";
  timestamp?: string;
  variant?: "normal" | "mirror" | "status";
}

export function ChatBubble({ message, sender, timestamp, variant = "normal" }: ChatBubbleProps) {
  const isUser = sender === "user";
  const isMirror = variant === "mirror";
  const isStatus = variant === "status";

  if (isStatus) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">{message}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex mb-3", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-emerald-600 text-white rounded-br-md"
            : isMirror
            ? "bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 text-gray-800 rounded-bl-md"
            : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
        )}
      >
        {isMirror && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">Cermin Polamu</span>
          </div>
        )}
        <p className="whitespace-pre-wrap">{message}</p>
        {timestamp && (
          <p className={cn("text-[10px] mt-1", isUser ? "text-emerald-200" : "text-gray-400")}>
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
}
