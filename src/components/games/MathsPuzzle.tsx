import React, { useState, useEffect } from 'react';
import { ArrowLeft, Brain, CheckCircle, RotateCcw, HelpCircle, Award } from 'lucide-react';
import { UserProfile } from '../../types';
import { soundManager } from '../../utils/audio';
import { awardReward, saveProfile } from '../../utils/storage';
import confetti from 'canvas-confetti';

interface MathsPuzzleProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onBackToMenu: () => void;
  onOpenScratchpad: () => void;
}

export const MathsPuzzle: React.FC<MathsPuzzleProps> = ({
  profile,
  onUpdateProfile,
  onBackToMenu,
  onOpenScratchpad
}) => {
  const [puzzleType, setPuzzleType] = useState<'pyramid' | 'operator' | 'magic'>('pyramid');
  const [solvedCount, setSolvedCount] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  // --- Pyramid State ---
  // Bottom row: [a, b, c]
  // Middle row: [a+b, b+c]
  // Top: (a+b) + (b+c)
  // One brick is missing (?)
  const [pyramid, setPyramid] = useState<{
    bottom: [number, number, number];
    middle: [number, number];
    top: number;
    missingKey: 'm0' | 'm1' | 'top' | 'b1';
    correctVal: number;
    options: number[];
  }>({
    bottom: [4, 7, 5],
    middle: [11, 12],
    top: 23,
    missingKey: 'top',
    correctVal: 23,
    options: [21, 23, 25, 27]
  });

  // --- Missing Operator State ---
  const [operatorProblem, setOperatorProblem] = useState<{
    left: number;
    right: number;
    result: number;
    correctOp: '+' | '-' | '×' | '÷';
  }>({
    left: 48,
    right: 6,
    result: 8,
    correctOp: '÷'
  });

  // --- Magic Matrix State ---
  // 2x2 or 3x3 matrix where target sum is given
  const [matrixProblem, setMatrixProblem] = useState<{
    targetSum: number;
    grid: (number | null)[]; // 4 cells: [a, b, c, null]
    correctVal: number;
    options: number[];
  }>({
    targetSum: 20,
    grid: [8, 12, 14, null],
    correctVal: 6,
    options: [4, 6, 8, 10]
  });

  const generatePyramid = () => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    const c = Math.floor(Math.random() * 8) + 2;
    const m0 = a + b;
    const m1 = b + c;
    const top = m0 + m1;

    const correctVal = top;
    const options = [correctVal - 3, correctVal, correctVal + 2, correctVal + 5].sort(() => 0.5 - Math.random());

    setPyramid({
      bottom: [a, b, c],
      middle: [m0, m1],
      top,
      missingKey: 'top',
      correctVal,
      options
    });
    setFeedback(null);
  };

  const generateOperator = () => {
    const ops: ('+' | '-' | '×' | '÷')[] = ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let left = 12;
    let right = 4;
    let result = 16;

    if (op === '+') {
      left = Math.floor(Math.random() * 30) + 10;
      right = Math.floor(Math.random() * 20) + 5;
      result = left + right;
    } else if (op === '-') {
      left = Math.floor(Math.random() * 40) + 20;
      right = Math.floor(Math.random() * 15) + 5;
      result = left - right;
    } else if (op === '×') {
      left = Math.floor(Math.random() * 10) + 3;
      right = Math.floor(Math.random() * 9) + 2;
      result = left * right;
    } else {
      right = Math.floor(Math.random() * 8) + 2;
      result = Math.floor(Math.random() * 8) + 2;
      left = right * result;
    }

    setOperatorProblem({ left, right, result, correctOp: op });
    setFeedback(null);
  };

  const generateMatrix = () => {
    const targetSum = 24;
    const a = 10;
    const b = targetSum - a; // 14
    const c = 8;
    const d = targetSum - c; // 16
    const correctVal = d;
    const options = [correctVal - 4, correctVal, correctVal + 3, correctVal + 6].sort(() => 0.5 - Math.random());

    setMatrixProblem({
      targetSum,
      grid: [a, b, c, null],
      correctVal,
      options
    });
    setFeedback(null);
  };

  useEffect(() => {
    generatePyramid();
    generateOperator();
    generateMatrix();
  }, [puzzleType]);

  const handlePyramidChoice = (val: number) => {
    if (val === pyramid.correctVal) {
      soundManager.playCorrect();
      setFeedback('🎉 Brilliant! Each brick equals the sum of the two supporting bricks below it!');
      rewardPuzzle();
      setTimeout(generatePyramid, 1400);
    } else {
      soundManager.playWrong();
      setFeedback('❌ Check the sum again: add the two middle blocks to find the top!');
    }
  };

  const handleOperatorChoice = (op: '+' | '-' | '×' | '÷') => {
    if (op === operatorProblem.correctOp) {
      soundManager.playCorrect();
      setFeedback(`🎉 Perfect! ${operatorProblem.left} ${op} ${operatorProblem.right} = ${operatorProblem.result}`);
      rewardPuzzle();
      setTimeout(generateOperator, 1400);
    } else {
      soundManager.playWrong();
      setFeedback('❌ Test each operation to see which one equals the target result.');
    }
  };

  const handleMatrixChoice = (val: number) => {
    if (val === matrixProblem.correctVal) {
      soundManager.playCorrect();
      setFeedback('🎉 Correct! Every row now adds up to the target sum!');
      rewardPuzzle();
      setTimeout(generateMatrix, 1400);
    } else {
      soundManager.playWrong();
      setFeedback(`❌ The row must sum up to ${matrixProblem.targetSum}! Try again.`);
    }
  };

  const rewardPuzzle = () => {
    setSolvedCount(c => c + 1);
    setStreak(s => s + 1);
    const { updatedProfile } = awardReward(profile, 25, 20);
    onUpdateProfile(updatedProfile);
    saveProfile(updatedProfile);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBackToMenu}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
        >
          <ArrowLeft size={16} /> Exit Game
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenScratchpad}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-indigo-950 border border-slate-700 text-indigo-300 text-xs font-bold transition"
          >
            <span>📝</span> Scratchpad
          </button>
          <div className="text-xs text-indigo-400 font-bold bg-indigo-950/60 border border-indigo-600/40 px-3 py-1.5 rounded-xl">
            🧩 Maths Brain Teasers
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-center gap-2 mb-6 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 max-w-md mx-auto">
        <button
          onClick={() => { setPuzzleType('pyramid'); soundManager.playClick(); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            puzzleType === 'pyramid'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🔺 Number Bonds
        </button>
        <button
          onClick={() => { setPuzzleType('operator'); soundManager.playClick(); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            puzzleType === 'operator'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🔍 Missing Sign
        </button>
        <button
          onClick={() => { setPuzzleType('magic'); soundManager.playClick(); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
            puzzleType === 'magic'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🔲 Magic Matrix
        </button>
      </div>

      {/* Main Puzzle Area */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center">
        {puzzleType === 'pyramid' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold text-white font-game">Number Bond Pyramid</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Each brick is the sum of the two supporting bricks directly underneath it!
              </p>
            </div>

            {/* Pyramid Visual */}
            <div className="flex flex-col items-center gap-2 max-w-xs mx-auto py-3">
              {/* Top Brick */}
              <div className="w-16 h-12 rounded-xl bg-amber-500/30 border-2 border-amber-400 flex items-center justify-center font-extrabold text-xl text-amber-300 shadow-lg">
                ?
              </div>
              {/* Middle Row */}
              <div className="flex gap-2">
                <div className="w-16 h-12 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-lg text-white">
                  {pyramid.middle[0]}
                </div>
                <div className="w-16 h-12 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center font-bold text-lg text-white">
                  {pyramid.middle[1]}
                </div>
              </div>
              {/* Bottom Row */}
              <div className="flex gap-2">
                {pyramid.bottom.map((n, i) => (
                  <div
                    key={i}
                    className="w-16 h-12 rounded-xl bg-slate-850 border border-slate-700 flex items-center justify-center font-semibold text-base text-slate-300"
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>

            {/* Option Choices */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto pt-2">
              {pyramid.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handlePyramidChoice(opt)}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-400 text-white font-bold text-lg shadow-sm active:scale-95 transition"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {puzzleType === 'operator' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold text-white font-game">Missing Operation Detective</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Which mathematical symbol makes this equation true?
              </p>
            </div>

            {/* Equation visual */}
            <div className="flex items-center justify-center gap-3 py-6 text-2xl sm:text-3xl font-extrabold text-white">
              <span className="p-3 bg-slate-800 rounded-xl border border-slate-700">{operatorProblem.left}</span>
              <span className="p-3 bg-amber-500/20 border-2 border-amber-400 rounded-xl text-amber-400">?</span>
              <span className="p-3 bg-slate-800 rounded-xl border border-slate-700">{operatorProblem.right}</span>
              <span className="text-slate-400">=</span>
              <span className="p-3 bg-emerald-600/30 border border-emerald-400 rounded-xl text-emerald-300">{operatorProblem.result}</span>
            </div>

            {/* 4 Operations */}
            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
              {(['+', '-', '×', '÷'] as const).map((op) => (
                <button
                  key={op}
                  onClick={() => handleOperatorChoice(op)}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-amber-500/20 border border-slate-700 hover:border-amber-400 text-white font-bold text-2xl transition active:scale-95"
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        )}

        {puzzleType === 'magic' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold text-white font-game">Magic Math Matrix</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Find the missing value so each horizontal row sums to <strong>{matrixProblem.targetSum}</strong>!
              </p>
            </div>

            {/* 2x2 Matrix */}
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto py-2">
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 font-bold text-xl text-white">
                {matrixProblem.grid[0]}
              </div>
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 font-bold text-xl text-white">
                {matrixProblem.grid[1]}
              </div>
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 font-bold text-xl text-white">
                {matrixProblem.grid[2]}
              </div>
              <div className="p-4 rounded-xl bg-amber-500/20 border-2 border-amber-400 font-extrabold text-xl text-amber-300">
                ?
              </div>
            </div>

            {/* Choices */}
            <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
              {matrixProblem.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleMatrixChoice(opt)}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-indigo-600/30 border border-slate-700 hover:border-indigo-400 text-white font-bold text-lg transition active:scale-95"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Feedback banner */}
        {feedback && (
          <div className="mt-6 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm font-semibold text-slate-200 animate-in fade-in">
            {feedback}
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Puzzles Solved: <strong className="text-indigo-400">{solvedCount}</strong></span>
          <span>Streak: <strong className="text-orange-400">{streak} 🔥</strong></span>
        </div>
      </div>
    </div>
  );
};
