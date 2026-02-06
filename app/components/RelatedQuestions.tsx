"use client";

import { useState } from "react";

interface RelatedQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
}

export default function RelatedQuestions({ questions, onSelectQuestion }: RelatedQuestionsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 animate-fade-in">
      <h3 className="text-xl font-bold text-white mb-6">Related Questions</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {questions.map((question, idx) => {
          const isExpanded = expandedIndex === idx;
          const isLong = question.length > 120;
          const displayText = isLong && !isExpanded 
            ? `${question.substring(0, 120)}...` 
            : question;

          return (
            <button
              key={idx}
              onClick={() => onSelectQuestion(question)}
              onMouseEnter={() => isLong && setExpandedIndex(idx)}
              onMouseLeave={() => setExpandedIndex(null)}
              className="group relative px-5 py-4 bg-gray-900/60 hover:bg-gray-900/80 
                       border border-purple-800/30 hover:border-purple-600/50
                       rounded-xl transition-all duration-300 
                       hover:glow-purple-subtle backdrop-blur-sm
                       text-left"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <svg className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" 
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 group-hover:text-white leading-relaxed transition-colors">
                    {displayText}
                  </p>
                  {isLong && !isExpanded && (
                    <span className="text-xs text-purple-400 mt-2 block">Hover to expand</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
