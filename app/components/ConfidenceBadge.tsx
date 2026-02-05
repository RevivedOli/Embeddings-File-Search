"use client";

import { type ConfidenceLevel } from "@/types";

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
}

export default function ConfidenceBadge({ level }: ConfidenceBadgeProps) {
  const colors = {
    High: "bg-green-500/20 text-green-400 border-green-500/30",
    Medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    Low: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div
      className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-medium ${colors[level]}`}
    >
      <span className="w-2 h-2 rounded-full bg-current mr-2"></span>
      {level} Confidence
    </div>
  );
}
