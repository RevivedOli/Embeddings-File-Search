"use client";

import { useState, useRef, useEffect } from "react";

type LoadingStage = "idle" | "scanning" | "matching" | "synthesizing";

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  loadingStage: LoadingStage;
  value?: string;
  onChange?: (value: string) => void;
}

export default function QuestionInput({ onSubmit, isLoading, loadingStage, value, onChange }: QuestionInputProps) {
  const [internalQuestion, setInternalQuestion] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Use controlled value if provided, otherwise use internal state
  const question = value !== undefined ? value : internalQuestion;
  const setQuestion = onChange || setInternalQuestion;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
    }
  };

  const loadingMessages: Record<LoadingStage, string> = {
    idle: "",
    scanning: "Scanning documents...",
    matching: "Matching sources...",
    synthesizing: "Synthesizing findings...",
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-2 lg:gap-3">
        <input
          ref={inputRef as any}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Investigate the Epstein files..."
          className="flex-1 px-4 lg:px-6 py-3 lg:py-4 bg-gray-900/60 border border-purple-800/40 rounded-lg 
                     text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 
                     focus:glow-purple-subtle transition-all duration-300
                     text-sm lg:text-base backdrop-blur-sm"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim()}
          className="px-4 lg:px-8 py-3 lg:py-4 bg-purple-600 hover:bg-purple-700 
                     text-white font-semibold rounded-lg transition-all duration-300
                     disabled:opacity-50 disabled:cursor-not-allowed
                     enabled:glow-purple enabled:hover:glow-purple-strong
                     whitespace-nowrap text-sm lg:text-base"
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </div>
      
      {isLoading && (
        <div className="mt-4 flex items-center gap-3 text-purple-400">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
          </div>
          <span className="text-sm">{loadingMessages[loadingStage]}</span>
        </div>
      )}
    </form>
  );
}
