"use client";

import { useState, useRef, useEffect } from "react";
import { type Source } from "@/types";

interface ReferencesPanelProps {
  sources: Source[];
  isOpen?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

export default function ReferencesPanel({ sources, isOpen = true, onToggle, isMobile = false }: ReferencesPanelProps) {
  const [expandedSource, setExpandedSource] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleCopyCitation = (source: Source) => {
    const citation = `[${source.metadata.title || source.metadata.document_id || "Source"}]
Date: ${source.metadata.date || "Unknown"}
Relevance Score: ${(source.score * 100).toFixed(1)}%
${source.text}`;
    navigator.clipboard.writeText(citation);
  };

  // Scroll to top when panel opens on mobile
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const getDatasetInfo = (source: Source): string => {
    const dataset = source.metadata.dataset_number as string ||
                   source.metadata.dataset as string || 
                   source.metadata.dataset_id as string || 
                   "Unknown";
    const docType = source.metadata.document_type as string || 
                   source.metadata.type as string || 
                   "Document";
    return `Dataset ${dataset} · ${docType}`;
  };

  if (sources.length === 0) {
    return (
      <div className="h-full flex flex-col overflow-hidden w-full">
        <div className="flex items-center justify-between p-4 lg:p-6 border-b border-purple-800/20 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">References</h2>
          {onToggle && (
            <button
              onClick={onToggle}
              className="lg:hidden text-purple-400 hover:text-purple-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 lg:p-6">
          <p className="text-gray-500 text-sm">No references yet</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={panelRef} className="h-full flex flex-col overflow-hidden w-full animate-slide-in-right">
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-purple-800/20 flex-shrink-0">
        <h2 className="text-xl font-bold text-white">References</h2>
        {onToggle && (
          <button
            onClick={onToggle}
            className="text-purple-400 hover:text-purple-300 transition-colors"
            aria-label={isMobile ? "Close references" : "Close references"}
          >
            {isMobile ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            )}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="space-y-4">
        {sources.map((source, idx) => {
          const isExpanded = expandedSource === source.id;
          const docId = source.metadata.document_id as string || source.id;
          const datasetInfo = getDatasetInfo(source);

          return (
            <div
              key={source.id}
              className="bg-gray-800/40 border border-purple-800/20 rounded-lg p-5 
                       hover:border-purple-600/40 transition-all duration-300
                       backdrop-blur-sm"
            >
              <div className="mb-4">
                <div className="font-mono text-sm font-semibold text-purple-300 mb-2">
                  {docId}
                </div>
                <div className="text-xs text-gray-400 mb-3">
                  {datasetInfo}
                </div>
                <div className="flex items-center gap-3">
                  <a
                    href={source.metadata.doj_url as string || `https://www.justice.gov/epstein/files/DataSet%20${source.metadata.dataset_number || '1'}/${docId}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-cyan-400 hover:text-cyan-300 
                             hover:underline transition-colors"
                  >
                    Open DOJ PDF
                  </a>
                  <button
                    onClick={() => setExpandedSource(isExpanded ? null : source.id)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 
                             hover:underline transition-colors"
                  >
                    View context
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-purple-800/20">
                  <p className="text-sm text-gray-300 leading-relaxed mb-3">
                    {source.text}
                  </p>
                  <div className="text-xs text-gray-500 space-y-1">
                    {source.metadata.date && (
                      <p><strong>Date:</strong> {source.metadata.date as string}</p>
                    )}
                    <p><strong>Relevance:</strong> {(source.score * 100).toFixed(1)}%</p>
                    {source.metadata.ocr_quality && (
                      <p><strong>OCR Quality:</strong> {source.metadata.ocr_quality as string}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCopyCitation(source)}
                    className="mt-3 px-3 py-1.5 text-xs bg-purple-600/20 hover:bg-purple-600/30 
                             text-purple-300 rounded border border-purple-600/30 
                             transition-all duration-300"
                  >
                    Copy Citation
                  </button>
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}
