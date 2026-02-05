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

  const handleShare = () => {
    const queryToShare = question || "";
    const url = generateShareableUrl(queryToShare, window.location.origin);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
              className="px-4 py-2 text-sm bg-purple-600/20 hover:bg-purple-600/30 
                       text-purple-300 rounded-lg border border-purple-600/30 
                       transition-all duration-300 hover:glow-purple-subtle"
            >
              {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm bg-purple-600/20 hover:bg-purple-600/30 
                       text-purple-300 rounded-lg border border-purple-600/30 
                       transition-all duration-300 hover:glow-purple-subtle"
            >
              Export
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
