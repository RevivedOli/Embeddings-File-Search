"use client";

import { useState, useEffect } from "react";
import { type SearchHistoryItem } from "@/types";

interface SearchHistoryProps {
  onSelectQuery: (query: string) => void;
  onAddToHistory?: (question: string, confidence?: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export default function SearchHistory({ onSelectQuery, onAddToHistory, isMobile = false, onClose }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem("epstein-search-history");
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as SearchHistoryItem[];
        setHistory(parsed);
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }
  }, []);

  const addToHistory = (question: string, confidence?: string) => {
    const newItem: SearchHistoryItem = {
      id: Date.now().toString(),
      question,
      timestamp: Date.now(),
      confidence: confidence as any,
    };

    const updated = [newItem, ...history.filter(h => h.question !== question)].slice(0, 20);
    setHistory(updated);
    localStorage.setItem("epstein-search-history", JSON.stringify(updated));
    
    // Also call the callback if provided
    if (onAddToHistory) {
      onAddToHistory(question, confidence);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("epstein-search-history");
  };

  // Expose addToHistory to parent via window (for backward compatibility)
  useEffect(() => {
    (window as any).addSearchToHistory = addToHistory;
    return () => {
      delete (window as any).addSearchToHistory;
    };
  }, [history]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`
      ${isMobile ? 'bg-[#0a0a0a]' : 'bg-gray-900/30'} 
      border-r border-purple-800/20 
      ${isMobile ? 'w-full h-full flex flex-col overflow-hidden' : 'flex flex-col h-full overflow-hidden w-80'}
      flex-shrink-0
    `}>
      <div className="p-4 lg:p-6 border-b border-purple-800/20 flex items-center justify-between flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Recent Investigations
        </h2>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              className="px-3 py-1.5 text-xs font-medium bg-gray-800/50 hover:bg-gray-700/50 
                       text-gray-400 hover:text-gray-200 rounded-md border border-gray-700/50 
                       hover:border-gray-600/50 transition-all duration-200"
            >
              Clear
            </button>
          )}
          {isMobile && (
            <button
              onClick={onClose}
              className="text-purple-400 hover:text-purple-300 transition-colors p-2"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {history.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No investigations yet
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectQuery(item.question);
                  if (isMobile && onClose) {
                    onClose();
                  }
                }}
                className="w-full text-left px-4 py-3 bg-purple-600/10 hover:bg-purple-600/20 
                         border border-purple-600/20 hover:border-purple-500/40
                         text-purple-200 hover:text-purple-100 rounded-lg
                         transition-all duration-300 text-sm font-medium
                         hover:glow-purple-subtle group"
              >
                <span className="block">{item.question}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
