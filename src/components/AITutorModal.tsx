import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Edit3,
  CheckCircle,
  Copy,
  Check,
  HelpCircle,
  Calculator,
  RefreshCw,
} from 'lucide-react';
import { Question, SchoolLevel } from '../types';
import { askTeacherHelton } from '../utils/api';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  studentAnswer: string | null;
  level: SchoolLevel;
  onOpenScratchpad?: () => void;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  question,
  studentAnswer,
  level,
  onOpenScratchpad,
}) => {
  const [queryInput, setQueryInput] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeQuestionTopic, setActiveQuestionTopic] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Quick preset questions for Nigerian learners
  const PRESET_QUESTIONS = [
    { label: '⚡ 35 × 14', query: 'What is 35 * 14 step-by-step?' },
    { label: '🔢 Solve 3x - 15 = 45', query: 'Solve for x: 3x - 15 = 45' },
    { label: '₦ 20% Discount on ₦5,000', query: 'How do I calculate a 20% discount on ₦5,000 ticket?' },
    { label: '📐 Perimeter of 100m × 60m', query: 'What is the perimeter of a football pitch measuring 100m by 60m?' },
    { label: '➗ How to Divide Fractions', query: 'Explain how to divide fractions like 2/3 divided by 4/5 with examples' },
    { label: '🛒 Danfo Bus Fare Change', query: 'If a Danfo bus fare is ₦400 and I give ₦1,000 note for 2 people, what is my change?' }
  ];

  // Request solution from Mr Helton
  const requestExplanation = async (userQ: string, isFromGameQuestion: boolean = false) => {
    setLoading(true);
    setActiveQuestionTopic(userQ);

    try {
      const qText = isFromGameQuestion && question ? question.question : userQ;
      const cAns = isFromGameQuestion && question ? question.correctAnswer : '';
      const sAns = isFromGameQuestion ? studentAnswer : null;

      const res = await askTeacherHelton(qText, sAns, cAns, level, userQ);
      setExplanation(res);
    } catch {
      setExplanation(
        `Hello champion! I am Mr Helton, your Mathematics Coach.\n\n` +
        `Always break mathematical questions down step-by-step: write out what is given, choose the right formula or operation, and verify your arithmetic. Practice makes a true maths champion!`
      );
    } finally {
      setLoading(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // Initial load when modal opens
  useEffect(() => {
    if (!isOpen) {
      if (speaking) {
        window.speechSynthesis?.cancel();
        setSpeaking(false);
      }
      return;
    }

    if (question) {
      // Opened with a specific game question context
      setQueryInput('');
      requestExplanation(question.question, true);
    } else {
      // Opened as free-form "Ask Mr Helton"
      setQueryInput('');
      requestExplanation('What are the top 3 tricks to get an A in Mathematics this term?', false);
    }
  }, [isOpen, question]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleAskCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = queryInput.trim();
    if (!trimmed) return;
    requestExplanation(trimmed, false);
    setQueryInput('');
  };

  const handlePresetClick = (query: string) => {
    setQueryInput(query);
    requestExplanation(query, false);
  };

  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean text for speech
    const cleanText = explanation.replace(/[\*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyExplanation = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl shadow-2xl shadow-emerald-950/70 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border-b border-emerald-700/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-400 flex items-center justify-center text-2xl shadow-lg ring-2 ring-emerald-400/40">
                👨🏾‍🏫
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 flex items-center justify-center text-[9px] text-black font-black">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white font-game tracking-wide">
                  Ask Mr Helton
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {level} Coach
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                AI Mathematics Teacher • Step-by-Step Problem Solver & Clinic
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Read-Aloud Button */}
            <button
              onClick={handleToggleSpeak}
              disabled={loading || !explanation}
              className={`p-2 rounded-xl transition cursor-pointer border ${
                speaking
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                  : 'bg-slate-800 text-emerald-300 hover:text-white hover:bg-slate-700 border-slate-700'
              }`}
              title={speaking ? 'Stop Reading' : 'Listen to Mr Helton Speak'}
            >
              {speaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-slate-200 text-sm leading-relaxed custom-scrollbar">
          {/* If opened from a game question review */}
          {question && (
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={14} /> Reviewing Game Question:
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {question.topic || 'Curriculum Maths'}
                </span>
              </div>
              <p className="text-sm font-semibold text-white">{question.question}</p>

              {studentAnswer && (
                <div className="text-xs flex items-center gap-2 pt-1">
                  <span className="text-slate-400">Your selection:</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-950/60 text-rose-300 border border-rose-800 font-medium">
                    {studentAnswer}
                  </span>
                </div>
              )}

              <div className="text-xs flex items-center gap-2">
                <span className="text-slate-400">Correct solution:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-700 font-bold">
                  {question.correctAnswer}
                </span>
              </div>

              {question.hint && (
                <div className="mt-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <span>💡</span>
                  <span><strong>Hint:</strong> {question.hint}</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Preset Math Topic Pills */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Calculator size={13} className="text-amber-400" />
              Quick Questions to Ask Mr Helton:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_QUESTIONS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePresetClick(preset.query)}
                  className="px-2.5 py-1 rounded-xl bg-slate-800/80 hover:bg-emerald-950 hover:text-emerald-300 border border-slate-700 hover:border-emerald-500/50 text-[11px] font-medium text-slate-300 transition cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Solution Body */}
          <div className="bg-slate-950/80 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <Sparkles size={16} className="text-amber-400" />
                <span>Mr Helton's Step-by-Step Breakdown</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopyExplanation}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition cursor-pointer"
                  title="Copy Solution"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {onOpenScratchpad && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenScratchpad();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs flex items-center gap-1 transition cursor-pointer"
                    title="Open Scratchpad"
                  >
                    <Edit3 size={13} />
                    <span>Scratchpad</span>
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-300 font-medium">
                  Mr Helton is writing out your step-by-step mathematical working...
                </p>
                <p className="text-xs text-slate-500">Checking arithmetic & curriculum rules</p>
              </div>
            ) : (
              <div className="whitespace-pre-line text-slate-200 text-sm leading-relaxed font-sans">
                {explanation}
              </div>
            )}
          </div>

          <div ref={chatBottomRef} />
        </div>

        {/* Interactive Query Input Bar (Allows Students to Ask ANY Question!) */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={handleAskCustom} className="flex items-center gap-2">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask Mr Helton any maths question... (e.g. 45 * 18, 2x + 5 = 15, or % of ₦8,000)"
              className="flex-1 bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !queryInput.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer shrink-0"
            >
              {loading ? (
                <RefreshCw size={17} className="animate-spin" />
              ) : (
                <>
                  <span>Ask</span>
                  <Send size={15} />
                </>
              )}
            </button>
          </form>
          <p className="text-[10px] text-slate-400 text-center mt-2">
            💡 Type any equation, arithmetic problem, word problem, or math concept to get instant step-by-step guidance.
          </p>
        </div>
      </div>
    </div>
  );
};
