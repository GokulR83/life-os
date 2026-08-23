import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { getCardsDueToday } from '../../utils/sm2';
import { BrainCircuit, Play, Layers } from 'lucide-react';

export const FlashcardWidget = () => {
  const navigate = useNavigate();
  const { flashcards } = useData();

  const dueCards = getCardsDueToday(flashcards);

  return (
    <div className="p-5 rounded-3xl border border-theme-border bg-theme-card shadow-sm flex items-center justify-between gap-4">
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="p-3 rounded-2xl bg-theme-accent-light text-theme-accent border border-theme-border shrink-0">
          <BrainCircuit className="h-6 w-6" />
        </div>
        <div className="truncate">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded-full bg-theme-accent text-white text-[10px] font-extrabold shadow-sm">
              SM-2 Algorithm
            </span>
            <h3 className="text-sm font-bold text-theme-main">Spaced Repetition Deck</h3>
          </div>
          <p className="text-xs text-theme-muted mt-1 truncate">
            {dueCards.length === 0 ? (
              <span className="text-emerald-400 font-bold">Deck caught up — 0 cards due today!</span>
            ) : (
              <><strong className="text-theme-accent font-extrabold">{dueCards.length} Cards Due Today</strong> for optimal retention</>
            )}
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/dsa')}
        className="px-4 py-2.5 rounded-2xl bg-gradient-dual text-white font-bold text-xs shadow-md shadow-theme-accent/20 transition active:scale-95 cursor-pointer flex items-center space-x-1.5 shrink-0"
      >
        <Play className="h-4 w-4 fill-white" />
        <span>Start Review</span>
      </button>
    </div>
  );
};
