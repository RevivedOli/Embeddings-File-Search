"use client";

import { useState, useEffect, useRef } from "react";
import DatasetCoverageBanner from "./components/DatasetCoverageBanner";
import QuestionInput from "./components/QuestionInput";
import SummaryBox from "./components/SummaryBox";
import ReferencesPanel from "./components/ReferencesPanel";
import SearchHistory from "./components/SearchHistory";
import RelatedQuestions from "./components/RelatedQuestions";
import IntroductionModal from "./components/IntroductionModal";
import { type QueryResponse } from "@/lib/schemas";
import { parseQueryFromUrl } from "@/lib/utils";

type LoadingStage = "idle" | "scanning" | "matching" | "synthesizing";

interface PineconeStats {
  totalRecordCount: number;
  namespace?: string;
  indexName: string;
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("idle");
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<PineconeStats | null>(null);
  const [isIndexOnline, setIsIndexOnline] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Closed on mobile by default
  const [isReferencesOpen, setIsReferencesOpen] = useState(false); // Closed by default, will be set to true on desktop
  const [isMobile, setIsMobile] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);

  // Detect mobile on mount and set references state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Set references open on desktop, closed on mobile
      if (!mobile) {
        setIsReferencesOpen(true);
      } else {
        setIsReferencesOpen(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch Pinecone stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json() as PineconeStats;
          setStats(data);
          setIsIndexOnline(true);
        } else {
          setIsIndexOnline(false);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
        setIsIndexOnline(false);
      }
    };
    fetchStats();
  }, []);

  // Check for query in URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const query = parseQueryFromUrl(params);
      if (query) {
        setQuestion(query);
        handleQuery(query);
      }
    }
  }, []);

  const handleQuery = async (query: string) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setLoadingStage("scanning");

    try {
      // Simulate loading stages
      setTimeout(() => setLoadingStage("matching"), 1000);
      setTimeout(() => setLoadingStage("synthesizing"), 2000);

      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch results");
      }

      const data = await res.json() as QueryResponse;
      setResponse(data);
      setLoadingStage("idle");

      // Add to history (handled by SearchHistory component via window method)
      if (typeof window !== "undefined" && (window as any).addSearchToHistory) {
        (window as any).addSearchToHistory(query, data.confidence);
      }

      // Use related questions from API response
      setRelatedQuestions(data.related_questions || []);

      // Update URL
      const encoded = encodeURIComponent(query);
      window.history.pushState({}, "", `?q=${encoded}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoadingStage("idle");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (q: string) => {
    setQuestion(q);
    handleQuery(q);
  };

  const handleHistorySelect = (q: string) => {
    setQuestion(q);
    handleQuery(q);
  };

  return (
    <div className="h-screen bg-[#0a0a0a] flex flex-col overflow-hidden">
      <IntroductionModal />
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-purple-800/20 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
          aria-label="Open search history"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white">Epstein Files</h1>
        <button
          onClick={() => setIsReferencesOpen(!isReferencesOpen)}
          className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
          aria-label="Toggle references"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden min-w-0 h-full pt-14 lg:pt-0">
        {/* Search History - Desktop sidebar (always visible), Mobile fullscreen (when opened) */}
        <div className={`
          ${isHistoryOpen && isMobile
            ? 'fixed inset-0 z-50' 
            : isMobile 
            ? 'hidden' 
            : 'flex-shrink-0 h-full'}
        `}>
          <SearchHistory 
            onSelectQuery={(q) => {
              handleHistorySelect(q);
              if (isMobile) setIsHistoryOpen(false); // Close on mobile after selection
            }}
            isMobile={isMobile}
            onClose={() => setIsHistoryOpen(false)}
          />
        </div>
        
        <div ref={mainContentRef} className="flex-1 flex flex-col overflow-hidden min-w-0 h-full relative">
          <main className="flex-1 overflow-y-auto p-4 lg:p-10 max-w-6xl mx-auto w-full min-w-0 pb-24 lg:pb-0">
            {/* Header Section - Hidden on mobile */}
            <div className="mb-6 lg:mb-10 hidden lg:block">
              <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
                Epstein Files — Intelligence Explorer
              </h1>
              <p className="text-gray-400 text-lg mb-6">
                Primary-source document analysis powered by embeddings
              </p>
              
              {/* Status Indicators */}
              <div className="flex items-center gap-6 text-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isIndexOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-gray-300">
                    {isIndexOnline ? "Index online" : "Index offline"}
                  </span>
                </div>
                {stats ? (
                  <span className="text-gray-500">
                    {stats.totalRecordCount.toLocaleString()} chunks
                  </span>
                ) : (
                  <span className="text-gray-500">Loading stats...</span>
                )}
              </div>
            </div>

            {/* Search Input - Hidden on mobile (shown at bottom) */}
            <div className="mb-6 lg:mb-10 hidden lg:block">
              <QuestionInput
                onSubmit={handleSubmit}
                isLoading={isLoading}
                loadingStage={loadingStage}
                value={question}
                onChange={setQuestion}
              />
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
                {error}
              </div>
            )}

            {!response && !isLoading && !error && (
              <div className="flex items-center justify-center absolute left-0 right-0 lg:relative lg:flex" style={{ top: '56px', bottom: '80px', height: 'calc(100vh - 136px)' }}>
                <p className="text-white text-sm lg:text-base font-medium opacity-60" style={{ fontFamily: 'var(--font-poppins), Poppins, sans-serif' }}>
                  What would you like to search?
                </p>
              </div>
            )}

            {response && (
              <>
                <SummaryBox response={response} question={question} />
                <RelatedQuestions
                  questions={relatedQuestions}
                  onSelectQuestion={handleSubmit}
                />
              </>
            )}
          </main>
        </div>

        {/* References Panel - Collapsible */}
        {isReferencesOpen ? (
          <div 
            id="references-panel"
            className="w-full lg:w-[420px] flex flex-shrink-0 h-full transition-all duration-300 overflow-hidden border-l border-purple-800/20"
          >
            <ReferencesPanel 
              sources={response?.sources || []} 
              isOpen={isReferencesOpen}
              isMobile={isMobile}
              onToggle={() => {
                if (isMobile) {
                  if (!isReferencesOpen) {
                    // Opening: Save current scroll position and scroll references to top
                    if (mainContentRef.current) {
                      setSavedScrollPosition(mainContentRef.current.scrollTop);
                    }
                    setIsReferencesOpen(true);
                    // Scroll references to top after opening
                    setTimeout(() => {
                      const panel = document.getElementById('references-panel');
                      if (panel) {
                        panel.scrollTop = 0;
                      }
                    }, 100);
                  } else {
                    // Closing: Restore scroll position
                    setIsReferencesOpen(false);
                    setTimeout(() => {
                      if (mainContentRef.current) {
                        mainContentRef.current.scrollTop = savedScrollPosition;
                      }
                    }, 100);
                  }
                } else {
                  setIsReferencesOpen(!isReferencesOpen);
                }
              }}
            />
          </div>
        ) : (
          <div className="hidden lg:flex flex-shrink-0 w-12 h-full border-l border-purple-800/20 bg-gray-900/30 items-center justify-center">
            <button
              onClick={() => setIsReferencesOpen(true)}
              className="p-2 text-purple-400 hover:text-purple-300 transition-colors rotate-180"
              aria-label="Open references"
              title="Open References"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Mobile Input - Fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-purple-800/20 p-4 z-40">
        <QuestionInput
          onSubmit={handleSubmit}
          isLoading={isLoading}
          loadingStage={loadingStage}
          value={question}
          onChange={setQuestion}
        />
      </div>
    </div>
  );
}
