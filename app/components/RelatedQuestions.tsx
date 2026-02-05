"use client";

interface RelatedQuestionsProps {
  questions: string[];
  onSelectQuestion: (question: string) => void;
}

export default function RelatedQuestions({ questions, onSelectQuestion }: RelatedQuestionsProps) {
  if (questions.length === 0) {
    return null;
  }

  return (
    <div className="mt-10 animate-fade-in">
      <h3 className="text-xl font-bold text-white mb-5">Related Questions</h3>
      <div className="flex flex-wrap gap-3">
        {questions.map((question, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(question)}
            className="px-5 py-3 bg-purple-600/15 hover:bg-purple-600/25 
                     text-purple-200 hover:text-purple-100 rounded-lg 
                     border border-purple-600/30 hover:border-purple-500/50
                     text-sm font-medium transition-all duration-300 
                     hover:glow-purple-subtle backdrop-blur-sm
                     text-left max-w-md"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  );
}
