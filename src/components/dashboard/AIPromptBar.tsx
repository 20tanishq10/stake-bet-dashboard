"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";

export function AIPromptBar() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    router.push(`/bets/create?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="relative group w-full mb-8">
      {/* Glowing background effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500 animate-pulse"></div>
      
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-center w-full rounded-xl border border-primary/20 bg-card/60 backdrop-blur-xl shadow-2xl p-2 transition-all hover:bg-card/80"
      >
        <div className="pl-3 pr-2 text-primary">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <input 
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask AI to create a bet... e.g. 'I bet $50 that Argentina wins 3-0 against Brazil'"
          className="flex-1 bg-transparent border-none text-base placeholder:text-muted-foreground focus:outline-none focus:ring-0 px-2 py-3"
        />
        <button 
          type="submit"
          disabled={!prompt.trim()}
          className="p-2.5 ml-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
