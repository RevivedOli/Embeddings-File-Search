"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { type QueryResponse } from "@/lib/schemas";
import { generateShareableUrl } from "@/lib/utils";
import { useState } from "react";

interface SummaryBoxProps {
  response: QueryResponse | null;
  question?: string;
}

export default function SummaryBox({ response, question }: SummaryBoxProps) {
  const [copied, setCopied] = useState(false);

  if (!response) {
    return null;
  }

  const handleShare = async () => {
    const queryToShare = question || "";
    const url = generateShareableUrl(queryToShare, window.location.origin);
    
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or non-HTTPS contexts
        const textArea = document.createElement("textarea");
        textArea.value = url;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
          // Last resort: show the URL in an alert
          alert(`Share this URL:\n${url}`);
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback: show the URL in an alert
      alert(`Share this URL:\n${url}`);
    }
  };

  const handleExport = () => {
    const content = `# Summary\n\n${response.summary_markdown}\n\n## Key Findings\n\n${response.key_findings.map(f => `- ${f}`).join("\n")}\n\n## Caveats\n\n${response.caveats.map(c => `- ${c}`).join("\n")}`;
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "epstein-query-results.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-900/40 border border-purple-800/30 rounded-xl p-8 animate-fade-in backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-white">Summary</h2>
        <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2.5 bg-purple-600/20 hover:bg-purple-600/30 
                       text-purple-300 rounded-lg border border-purple-600/30 
                       transition-all duration-300 hover:glow-purple-subtle"
              title={copied ? "Copied!" : "Share"}
              aria-label={copied ? "Copied!" : "Share"}
            >
              {copied ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              )}
            </button>
            <button
              onClick={handleExport}
              className="p-2.5 bg-purple-600/20 hover:bg-purple-600/30 
                       text-purple-300 rounded-lg border border-purple-600/30 
                       transition-all duration-300 hover:glow-purple-subtle"
              title="Export"
              aria-label="Export"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>
        </div>

      {/* Main Summary Text */}
      <div className="prose prose-invert prose-purple max-w-none mb-8 text-gray-200 leading-relaxed">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {response.summary_markdown}
        </ReactMarkdown>
      </div>

      {/* Key Finding Section */}
      {response.key_findings.length > 0 && (
        <div className="mb-8 pb-8 border-b border-purple-800/20">
          <h3 className="text-lg font-bold text-cyan-400 mb-4">Key Finding</h3>
          <p className="text-gray-300 leading-relaxed">
            {response.key_findings[0]}
          </p>
          {response.key_findings.length > 1 && (
            <ul className="mt-3 space-y-2 text-gray-300">
              {response.key_findings.slice(1).map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Source Extract Section */}
      {response.sources.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-cyan-400 mb-4">Source Extract</h3>
          <blockquote className="border-l-4 border-purple-600/50 pl-6 py-4 bg-gray-800/30 rounded-r-lg">
            <p className="text-gray-300 italic leading-relaxed">
              {response.sources[0].text}
            </p>
          </blockquote>
        </div>
      )}

      {/* Caveats */}
      {response.caveats.length > 0 && (
        <div className="mt-8 pt-8 border-t border-purple-800/20">
          <h3 className="text-lg font-semibold text-yellow-400 mb-3">Caveats</h3>
          <ul className="space-y-2 text-yellow-300/80">
            {response.caveats.map((caveat, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-yellow-400 mt-1">⚠</span>
                <span>{caveat}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
