import React, { useState, useEffect } from 'react';
import { X, Sparkles, BookOpen, CheckCircle } from 'lucide-react';
import { Question, SchoolLevel } from '../types';
import { askTeacherHelton } from '../utils/api';

interface AITutorModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question | null;
  studentAnswer: string | null;
  level: SchoolLevel;
}

export const AITutorModal: React.FC<AITutorModalProps> = ({
  isOpen,
  onClose,
  question,
  studentAnswer,
  level
}) => {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isOpen || !question) return;

    let isMounted = true;
    setLoading(true);
    setExplanation('');

    askTeacherHelton(question.question, studentAnswer, question.correctAnswer, level)
      .then((res) => {
        if (isMounted) {
          setExplanation(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setExplanation(question.explanation || 'Work through each operation carefully from left to right.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, question, studentAnswer, level]);

  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 border-b border-emerald-700/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center -space-x-2">
              <div className="w-10 h-10 rounded-full bg-emerald-700/80 flex items-center justify-center text-xl shadow-inner border border-emerald-400/40 z-10">
                👨🏾‍🏫
              </div>
              <div className="w-9 h-9 rounded-full bg-pink-700/80 flex items-center justify-center text-lg shadow-inner border border-pink-400/40">
                👧🏾
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-game">Teacher Helton's Maths Clinic</h3>
              <p className="text-xs text-emerald-200">AI Mathematics Coach Helton • Step-by-Step Guidance</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Question Review Banner */}
        <div className="p-4 bg-slate-800/80 border-b border-slate-700/80">
          <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            Question
          </div>
          <p className="text-sm font-medium text-slate-100">{question.question}</p>
          {question.hint && (
            <div className="mt-2 text-xs text-amber-300 bg-amber-950/40 border border-amber-800/40 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <span>💡</span>
              <span><strong>Hint:</strong> {question.hint}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-slate-200 text-sm leading-relaxed">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
              <div className="w-10 h-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400 font-medium">Teacher Helton is preparing your step-by-step solution...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Sparkles size={16} />
                  <span>Step-by-Step Breakdown from Teacher Helton</span>
                </div>
                <div className="whitespace-pre-line text-slate-300 text-sm">
                  {explanation}
                </div>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-700/40 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-400 font-semibold">Correct Solution</div>
                  <div className="text-base font-bold text-white mt-0.5">{question.correctAnswer}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-600/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle size={20} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-900 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition"
          >
            Got It, Thanks Teacher Helton!
          </button>
        </div>
      </div>
    </div>
  );
};
