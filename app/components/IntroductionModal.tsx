"use client";

import { useState, useEffect } from "react";

export default function IntroductionModal() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Show modal on every page load/refresh
    setIsOpen(true);
  }, []);

  const handleAccept = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-6 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 border border-purple-800/50 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-in">
        <div className="p-6 lg:p-10">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              Epstein Files — Intelligence Explorer
            </h2>
            <p className="text-gray-400 text-base lg:text-lg">
              Primary-source document analysis powered by AI
            </p>
          </div>

          {/* How It Works */}
          <div className="mb-6 lg:mb-8">
            <h3 className="text-lg lg:text-xl font-semibold text-white mb-4">How It Works</h3>
            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-semibold text-sm mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-medium text-white mb-1">Ask Your Question</p>
                  <p className="text-sm">Enter any question about the Epstein files. The system will search through thousands of official DOJ documents.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-semibold text-sm mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-medium text-white mb-1">AI Analysis</p>
                  <p className="text-sm">Our AI agent scans, matches, and synthesizes information from relevant source documents to provide you with a comprehensive answer.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-semibold text-sm mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-medium text-white mb-1">Review Sources</p>
                  <p className="text-sm">Every answer includes references to the original documents. Click on any source to view the full context and verify the information.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Disclaimer */}
          <div className="mb-6 lg:mb-8 p-4 lg:p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h4 className="text-lg font-semibold text-yellow-400 mb-2">Important Disclaimer</h4>
                <p className="text-yellow-200/90 text-sm leading-relaxed">
                  <strong className="text-yellow-300">The presence of a person&apos;s name in these investigative files does not imply wrongdoing.</strong> These documents contain unverified claims, redacted information, and materials that may include disputed or sensationalist content as noted by the DOJ itself. All information should be verified through official sources.
                </p>
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="mb-6 lg:mb-8 text-xs lg:text-sm text-gray-400 space-y-2">
            <p>• All searches are processed locally in your browser - no queries are stored</p>
            <p>• Source documents are official DOJ releases under the Epstein Files Transparency Act (EFTA)</p>
            <p>• OCR quality may affect text extraction accuracy (documents were scanned at 96 DPI)</p>
          </div>

          {/* Accept Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAccept}
              className="w-full lg:w-auto px-6 lg:px-8 py-3 bg-purple-600 hover:bg-purple-700 
                       text-white font-semibold rounded-lg transition-all duration-300
                       glow-purple hover:glow-purple-strong text-sm lg:text-base"
            >
              I Understand, Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
