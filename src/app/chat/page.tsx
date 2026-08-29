"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SkipForward } from "lucide-react";
import { Header } from "@/components/layout/header";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { ChatInput } from "@/components/chat/chat-input";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { MirrorCard } from "@/components/chat/mirror-card";
import { translations, Language, getLangFromCookies } from "@/lib/i18n";

interface Message {
  id: string;
  text: string;
  sender: "system" | "user";
  variant?: "normal" | "mirror" | "status";
}

interface MirrorData {
  mirror: string;
  stats: { count: number; towardCount: number; awayCount: number; dominantPattern: string };
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<{ id: string; text: string } | null>(null);
  const [mirrorData, setMirrorData] = useState<MirrorData | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [lang, setLang] = useState<Language>("id");
  const t = translations[lang];

  const getSessionId = useCallback((): string => {
    let sid = localStorage.getItem("pola-session-id");
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem("pola-session-id", sid);
      document.cookie = `pola-session-id=${sid}; path=/; max-age=${90 * 24 * 60 * 60}; samesite=lax`;
    }
    return sid;
  }, []);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 100);
  }, []);

  const addMessage = useCallback((msg: Omit<Message, "id">) => {
    setMessages(prev => [...prev, { ...msg, id: crypto.randomUUID() }]);
  }, []);

  const fetchNextScenario = useCallback(async (currentLang: Language) => {
    const sid = getSessionId();
    setTyping(true);
    try {
      const res = await fetch(`/api/scenario/next?sessionId=${sid}&lang=${currentLang}`);
      const data = await res.json();

      // Simulate typing delay
      await new Promise(r => setTimeout(r, 1000));
      setTyping(false);

      if (data.scenario) {
        setCurrentScenario(data.scenario);
        addMessage({ text: data.scenario.text, sender: "system" });
        setInputDisabled(false);
      } else {
        setAllDone(true);
        // Check for mirror
        const mirrorRes = await fetch(`/api/mirror?sessionId=${sid}&lang=${currentLang}`);
        const mirrorJson = await mirrorRes.json();
        if (mirrorJson.ready) {
          setMirrorData({ mirror: mirrorJson.mirror, stats: mirrorJson.stats });
        }
        addMessage({ text: translations[currentLang].allDone, sender: "system" });
      }
    } catch (err) {
      setTyping(false);
      addMessage({ text: translations[currentLang].error, sender: "system" });
    }
    scrollToBottom();
  }, [getSessionId, addMessage, scrollToBottom]);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    // Check consent
    const consent = document.cookie.includes("pola-consent=true");
    if (!consent) {
      router.push("/");
      return;
    }

    const currentLang = getLangFromCookies();
    setLang(currentLang);
    const ct = translations[currentLang];

    const name = localStorage.getItem("pola-name");
    if (name) {
      addMessage({ text: ct.chatGreeting.replace("{name}", name), sender: "system" });
    } else {
      addMessage({ text: ct.chatGreetingNoName, sender: "system" });
    }

    fetchNextScenario(currentLang);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSend = async (text: string) => {
    if (!currentScenario) return;
    const sid = getSessionId();

    addMessage({ text, sender: "user" });
    setInputDisabled(true);
    setTyping(true);
    scrollToBottom();

    try {
      await fetch("/api/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, scenarioId: currentScenario.id, text, lang }),
      });

      await new Promise(r => setTimeout(r, 800));
      setTyping(false);
      addMessage({ text: t.saved, sender: "system", variant: "status" });

      // Check mirror
      const mirrorRes = await fetch(`/api/mirror?sessionId=${sid}&lang=${lang}`);
      const mirrorJson = await mirrorRes.json();

      if (mirrorJson.ready && !mirrorData) {
        await new Promise(r => setTimeout(r, 500));
        setMirrorData({ mirror: mirrorJson.mirror, stats: mirrorJson.stats });
      }

      setCurrentScenario(null);
    } catch (err) {
      setTyping(false);
      addMessage({ text: t.errorSend, sender: "system" });
      setInputDisabled(false);
    }
    scrollToBottom();
  };

  const handleNextScenario = () => {
    setMirrorData(null);
    fetchNextScenario(lang);
  };

  const handleDelete = async () => {
    const sid = getSessionId();
    try {
      await fetch(`/api/response/delete?sessionId=${sid}`, { method: "DELETE" });
      localStorage.removeItem("pola-session-id");
      localStorage.removeItem("pola-name");
      document.cookie = "pola-session-id=; path=/; max-age=0";
      document.cookie = "pola-consent=; path=/; max-age=0";
      router.push("/");
    } catch (err) {
      alert(t.deleteError);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-lg mx-auto bg-gray-50">
      <Header showDelete onDelete={handleDelete} lang={lang} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto chat-scroll p-4 bg-[#e5ded8]">
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg.text} sender={msg.sender} variant={msg.variant} />
        ))}
        {typing && <TypingIndicator />}
        {mirrorData && (
          <MirrorCard
            mirrorText={mirrorData.mirror}
            stats={mirrorData.stats}
            onContinue={allDone ? undefined : handleNextScenario}
            lang={lang}
          />
        )}
        {!currentScenario && !allDone && !mirrorData && !typing && (
          <div className="flex justify-center mt-4">
            <button
              onClick={handleNextScenario}
              className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
            >
              <SkipForward className="w-4 h-4" />
              {t.nextScenarioDemo}
            </button>
          </div>
        )}
      </div>

      <ChatInput onSend={handleSend} disabled={inputDisabled || allDone || !currentScenario} placeholder={t.chatInputPlaceholder} />
    </div>
  );
}
