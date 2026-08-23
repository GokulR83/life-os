// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useDSAStore } from '../store/useDSAStore';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { CustomSelect } from '../components/common/CustomSelect';
import { calculateSM2 } from '../utils/sm2';
import {
  BrainCircuit,
  Maximize2,
  Search,
  Layers,
  Undo2,
  Network,
  GitFork,
  Server,
  Play,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode,
  ArrowRight,
  Plus,
  Sparkles,
  Loader2,
  FileText,
  Bot,
  Code,
  Zap,
  Edit3,
  Trash2,
  PlusCircle,
  Check
} from 'lucide-react';

export const DSARevision = () => {
  const dataCtx = useData();
  const dsaStore = useDSAStore();

  const dsaPatterns = dsaStore.dsaPatterns || dataCtx.dsaPatterns || [];
  const flashcards = dsaStore.flashcards || dataCtx.flashcards || [];
  const notes = dataCtx.notes || [];

  const fetchFlashcardsApi = dsaStore.fetchFlashcardsApi || dataCtx.fetchFlashcardsApi;
  const fetchDsaPatternsApi = dsaStore.fetchDsaPatternsApi || dataCtx.fetchDsaPatternsApi;
  const addDsaPatternApi = dsaStore.addDsaPatternApi;
  const updateDsaPatternApi = dsaStore.updateDsaPatternApi;
  const deleteDsaPatternApi = dsaStore.deleteDsaPatternApi;

  const generateAiFlashcardApi = dsaStore.generateAiFlashcardApi || dataCtx.generateAiFlashcardApi;
  const addFlashcardApi = dsaStore.addFlashcardApi || dataCtx.addFlashcardApi;
  const toggleFlashcardRevisionApi = dsaStore.toggleFlashcardRevisionApi || dataCtx.toggleFlashcardRevisionApi;
  const updateFlashcardSM2 = dsaStore.updateFlashcardSM2;

  const [selectedPattern, setSelectedPattern] = useState(null);
  const [isRevisionSessionActive, setIsRevisionSessionActive] = useState(false);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionFlipped, setSessionFlipped] = useState(false);

  // Add Pattern Modal state
  const [isAddPatternModalOpen, setIsAddPatternModalOpen] = useState(false);
  const [patternNameInput, setPatternNameInput] = useState('');
  const [patternDescInput, setPatternDescInput] = useState('');
  const [patternSolvedInput, setPatternSolvedInput] = useState(0);
  const [patternTotalInput, setPatternTotalInput] = useState(15);
  const [patternDifficultyInput, setPatternDifficultyInput] = useState('Medium');

  // Edit Pattern state inside detail modal
  const [isEditingPattern, setIsEditingPattern] = useState(false);
  const [editSolved, setEditSolved] = useState(0);
  const [editTotal, setEditTotal] = useState(10);
  const [editDesc, setEditDesc] = useState('');
  const [editDifficulty, setEditDifficulty] = useState('Medium');

  // New Flashcard Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('ai'); // 'ai' | 'manual'
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [newPattern, setNewPattern] = useState('Two Pointers');
  const [isGenerating, setIsGenerating] = useState(false);

  // Manual Flashcard fields
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCodeSnippet, setNewCodeSnippet] = useState('');

  useEffect(() => {
    if (fetchFlashcardsApi) fetchFlashcardsApi(true);
    if (fetchDsaPatternsApi) fetchDsaPatternsApi(true);
  }, []);

  const patternIcons = {
    'Two Pointers': ArrowRight,
    'Sliding Window': Maximize2,
    'Binary Search': Search,
    'Dynamic Programming': Layers,
    'Backtracking': Undo2,
    'Graphs & BFS/DFS': Network,
    'Trees & Tries': GitFork,
    'System Design & Distributed Data': Server
  };

  const revisionDeck = (flashcards || []).filter(c => c.needsRevision !== false);
  const activeSessionCard = revisionDeck[sessionIndex % (revisionDeck.length || 1)];

  const handleNextSessionCard = (qualityScore: number) => {
    if (activeSessionCard) {
      const cardId = activeSessionCard.id || activeSessionCard._id;
      const currentEF = activeSessionCard.easeFactor || 2.5;
      const currentInterval = activeSessionCard.interval || 1;
      const currentRep = activeSessionCard.repetitions || 0;

      const sm2Res = calculateSM2(qualityScore, currentRep, currentInterval, currentEF);

      if (updateFlashcardSM2) {
        updateFlashcardSM2(cardId, {
          easeFactor: sm2Res.easeFactor,
          interval: sm2Res.interval,
          repetitions: sm2Res.repetitions,
          nextReviewDate: sm2Res.nextReviewDate,
          needsRevision: qualityScore < 3
        });
      }

      if (qualityScore >= 3 && toggleFlashcardRevisionApi) {
        toggleFlashcardRevisionApi(cardId);
      }
    }
    setSessionFlipped(false);
    setSessionIndex(prev => prev + 1);
  };

  const handleGenerateAiCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      let selectedNote = null;
      if (selectedNoteId) {
        selectedNote = notes.find((n: any) => (n.id || n._id) === selectedNoteId);
      }

      const payload = {
        noteId: selectedNoteId || undefined,
        noteContent: selectedNote ? `Title: ${selectedNote.title}\n\nContent:\n${selectedNote.content || ''}` : undefined,
        topic: aiTopic.trim() || (selectedNote ? selectedNote.title : 'DSA Algorithmic Pattern'),
        pattern: newPattern
      };

      if (generateAiFlashcardApi) {
        await generateAiFlashcardApi(payload);
      } else if (addFlashcardApi) {
        await addFlashcardApi({
          question: `How to solve ${payload.topic} using ${newPattern}?`,
          answer: `Optimal intuition and state transitions for ${payload.topic}.`,
          pattern: newPattern,
          isAiGenerated: true
        });
      }

      setAiTopic('');
      setSelectedNoteId('');
      setIsAddModalOpen(false);
    } catch (err) {
      console.warn('[AI_FLASHCARD_FRONTEND] Error generating AI card:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateManualFlashcard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const cardData = {
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      pattern: newPattern,
      category: newPattern,
      codeSnippet: newCodeSnippet.trim() || undefined,
      needsRevision: true
    };

    if (addFlashcardApi) {
      await addFlashcardApi(cardData);
    }

    setNewQuestion('');
    setNewAnswer('');
    setNewCodeSnippet('');
    setIsAddModalOpen(false);
  };

  const handleCreatePattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patternNameInput.trim()) return;

    if (addDsaPatternApi) {
      await addDsaPatternApi({
        name: patternNameInput.trim(),
        title: patternNameInput.trim(),
        pattern: patternNameInput.trim(),
        description: patternDescInput.trim() || 'Master core algorithmic technique and edge cases.',
        solvedProblems: Number(patternSolvedInput) || 0,
        totalProblems: Number(patternTotalInput) || 10,
        difficulty: patternDifficultyInput || 'Medium',
      });
    }

    setPatternNameInput('');
    setPatternDescInput('');
    setPatternSolvedInput(0);
    setPatternTotalInput(15);
    setIsAddPatternModalOpen(false);
  };

  const handleOpenPatternDetail = (pat: any) => {
    setSelectedPattern(pat);
    setIsEditingPattern(false);
    setEditSolved(pat.solvedProblems || 0);
    setEditTotal(pat.totalProblems || 10);
    setEditDesc(pat.description || '');
    setEditDifficulty(pat.difficulty || 'Medium');
  };

  const handleIncrementSolved = async (pattern: any) => {
    const patId = pattern.id || pattern._id;
    const currentSolved = pattern.solvedProblems || 0;
    const total = pattern.totalProblems || 10;
    const newSolved = Math.min(total, currentSolved + 1);

    if (updateDsaPatternApi) {
      await updateDsaPatternApi(patId, { solvedProblems: newSolved });
      setSelectedPattern((prev: any) => (prev ? { ...prev, solvedProblems: newSolved } : null));
    }
  };

  const handleSaveEditPattern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPattern) return;
    const patId = selectedPattern.id || selectedPattern._id;

    const payload = {
      description: editDesc,
      solvedProblems: Number(editSolved),
      totalProblems: Number(editTotal),
      difficulty: editDifficulty,
    };

    if (updateDsaPatternApi) {
      await updateDsaPatternApi(patId, payload);
      setSelectedPattern((prev: any) => (prev ? { ...prev, ...payload } : null));
    }
    setIsEditingPattern(false);
  };

  const handleDeletePattern = async (patternId: string) => {
    if (deleteDsaPatternApi) {
      await deleteDsaPatternApi(patternId);
    }
    setSelectedPattern(null);
  };

  return (
    <div className="space-y-6 select-none">
      {/* Page Banner & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-3xl border border-theme-border bg-theme-card shadow-lg">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-2xl bg-theme-accent-light text-theme-accent border border-theme-border">
              <BrainCircuit className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-theme-main tracking-tight flex items-center gap-2">
                DSA Pattern Revision Hub
                <Badge variant="orange" size="sm" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3 inline text-amber-400" />
                  <span>AI Powered</span>
                </Badge>
              </h2>
              <p className="text-xs text-theme-muted mt-0.5 max-w-xl">
                Focus on core algorithm patterns, generate AI flashcards from study notes, and practice SM-2 spaced repetition.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={() => setIsAddPatternModalOpen(true)}
            className="px-4 py-3 rounded-2xl border border-theme-border bg-theme-surface hover:bg-theme-card-hover font-bold text-xs text-theme-main shadow transition flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <PlusCircle className="h-4 w-4 text-theme-accent" />
            <span>+ New Pattern</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-3 rounded-2xl border border-theme-border bg-theme-surface hover:bg-theme-card-hover font-bold text-xs text-theme-main shadow transition flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>+ New AI / Manual Flashcard</span>
          </button>

          <button
            onClick={() => {
              setSessionIndex(0);
              setSessionFlipped(false);
              setIsRevisionSessionActive(true);
            }}
            disabled={revisionDeck.length === 0}
            className={`px-5 py-3 rounded-2xl bg-gradient-dual hover:opacity-90 text-white font-bold text-xs shadow-md shadow-theme-accent/20 transition flex items-center space-x-2 shrink-0 cursor-pointer active:scale-95 ${
              revisionDeck.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Play className="h-4 w-4 fill-white" />
            <span>Start Revision Session ({revisionDeck.length} Cards)</span>
          </button>
        </div>
      </div>

      {/* Grid of Pattern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dsaPatterns.map((pat) => {
          const IconComp = patternIcons[pat.name || pat.pattern] || BrainCircuit;
          const total = pat.totalProblems || 10;
          const solved = pat.solvedProblems || 0;
          const completionPct = Math.round((solved / total) * 100);
          const patternCards = (flashcards || []).filter(c => c.pattern === pat.name || c.category === pat.name);
          const needsRevCount = patternCards.filter(c => c.needsRevision !== false).length;

          return (
            <div
              key={pat.id || pat._id || pat.name}
              onClick={() => handleOpenPatternDetail(pat)}
              className="p-5 rounded-3xl border border-theme-border bg-theme-card shadow-sm hover:shadow-xl hover:border-theme-accent transition-all duration-200 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-2xl bg-theme-accent-light text-theme-accent group-hover:scale-110 transition-transform border border-theme-border">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <Badge variant="orange" size="sm">{pat.difficulty || 'Medium'}</Badge>
                </div>

                <h3 className="text-base font-extrabold text-theme-main group-hover:text-theme-accent transition">
                  {pat.name || pat.title || pat.pattern}
                </h3>
                <p className="text-xs text-theme-muted mt-1 line-clamp-2 leading-relaxed font-medium">
                  {pat.description || 'Master core algorithmic technique, edge cases and optimal complexity limits.'}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-theme-border space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-theme-muted">Problems Solved</span>
                  <span className="text-theme-main">{solved} / {total} ({completionPct}%)</span>
                </div>
                <ProgressBar progress={completionPct} height="h-1.5" />

                <div className="flex items-center justify-between text-[11px] text-theme-muted pt-1 font-semibold">
                  <span>Needs Revision: <strong className="text-rose-500 font-bold">{needsRevCount} cards</strong></span>
                  <span>Revised: {pat.lastRevisedDate || (pat.updatedAt ? pat.updatedAt.split('T')[0] : 'Today')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pattern Detail & Edit Modal View */}
      {selectedPattern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-2xl p-6 rounded-3xl border border-theme-border bg-theme-card shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-theme-border">
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-theme-accent">Pattern Details</span>
                <h3 className="text-lg font-extrabold text-theme-main">{selectedPattern.name || selectedPattern.pattern}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditingPattern(!isEditingPattern)}
                  className="px-3 py-1.5 rounded-xl border border-theme-border bg-theme-surface hover:bg-theme-card-hover text-xs font-bold text-theme-main flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>{isEditingPattern ? 'Cancel Edit' : 'Edit Pattern'}</span>
                </button>
                <button
                  onClick={() => handleDeletePattern(selectedPattern.id || selectedPattern._id)}
                  className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-400 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => setSelectedPattern(null)}
                  className="p-2 rounded-xl text-theme-muted hover:text-theme-main hover:bg-theme-card-hover cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {isEditingPattern ? (
              <form onSubmit={handleSaveEditPattern} className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-theme-muted mb-1 block">Description</label>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-theme-border bg-theme-surface text-xs font-semibold text-theme-main outline-none focus:border-theme-accent"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-theme-muted mb-1 block">Solved Problems</label>
                    <input
                      type="number"
                      value={editSolved}
                      onChange={(e) => setEditSolved(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-theme-border bg-theme-surface text-xs font-semibold text-theme-main outline-none focus:border-theme-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-theme-muted mb-1 block">Total Problems</label>
                    <input
                      type="number"
                      value={editTotal}
                      onChange={(e) => setEditTotal(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-theme-border bg-theme-surface text-xs font-semibold text-theme-main outline-none focus:border-theme-accent"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-theme-muted mb-1 block">Difficulty</label>
                    <CustomSelect
                      value={editDifficulty}
                      onChange={(e) => setEditDifficulty(e.target.value)}
                      options={['Easy', 'Easy - Medium', 'Medium', 'Medium - Hard', 'Hard']}
                      variant="default"
                      size="sm"
                      fullWidth
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingPattern(false)}
                    className="px-4 py-2 rounded-xl border border-theme-border text-xs font-bold text-theme-muted"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-theme-accent text-white text-xs font-bold shadow flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-theme-muted font-medium leading-relaxed">{selectedPattern.description}</p>

                {/* Progress & Quick Increment Action */}
                <div className="p-4 rounded-2xl border border-theme-border bg-theme-surface flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-theme-muted block">Progress</span>
                    <span className="text-sm font-extrabold text-theme-main">
                      {selectedPattern.solvedProblems || 0} / {selectedPattern.totalProblems || 10} Solved ({Math.round(((selectedPattern.solvedProblems || 0) / (selectedPattern.totalProblems || 10)) * 100)}%)
                    </span>
                  </div>
                  <button
                    onClick={() => handleIncrementSolved(selectedPattern)}
                    className="px-4 py-2 rounded-xl bg-gradient-dual text-white text-xs font-bold shadow-md hover:opacity-90 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>+1 Solved Problem</span>
                  </button>
                </div>

                <h4 className="text-xs font-extrabold uppercase tracking-wider text-theme-muted pt-2">
                  Pattern Flashcards ({(flashcards || []).filter(c => c.pattern === (selectedPattern.name || selectedPattern.pattern)).length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {(flashcards || []).filter(c => c.pattern === (selectedPattern.name || selectedPattern.pattern)).map((card) => (
                    <div key={card.id || card._id} className="p-3 rounded-2xl border border-theme-border bg-theme-surface space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-theme-main">{card.question}</span>
                        {card.isAiGenerated && (
                          <Badge variant="purple" size="xs" className="flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> AI
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-theme-muted leading-relaxed line-clamp-2">{card.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Dedicated Revision Session Modal */}
      {isRevisionSessionActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl p-6 rounded-3xl border border-theme-border bg-theme-card shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-theme-border">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="h-5 w-5 text-theme-accent" />
                <span className="text-sm font-extrabold text-theme-main">
                  SM-2 Revision Session ({sessionIndex + 1} / {revisionDeck.length || 1})
                </span>
              </div>
              <button
                onClick={() => setIsRevisionSessionActive(false)}
                className="p-1.5 rounded-xl text-theme-muted hover:text-theme-main hover:bg-theme-card-hover cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeSessionCard ? (
              <div className="space-y-4">
                {/* Flashcard Box */}
                <div
                  onClick={() => setSessionFlipped(!sessionFlipped)}
                  className="min-h-[220px] p-6 rounded-2xl border border-theme-border bg-theme-surface hover:border-theme-accent/50 transition cursor-pointer flex flex-col justify-between space-y-4 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-xl bg-theme-accent-light border border-theme-border text-theme-accent text-[10px] font-extrabold">
                      {activeSessionCard.pattern || 'Two Pointers'}
                    </span>
                    {activeSessionCard.isAiGenerated && (
                      <Badge variant="purple" size="sm" className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" /> ✨ AI Flashcard
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-theme-muted mb-1">
                      {sessionFlipped ? 'Answer & Intuition' : 'Question Prompt'}
                    </h4>
                    <p className="text-sm font-bold text-theme-main leading-relaxed">
                      {sessionFlipped ? activeSessionCard.answer : activeSessionCard.question}
                    </p>

                    {sessionFlipped && activeSessionCard.codeSnippet && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-theme-border text-[11px] font-mono text-emerald-400 overflow-x-auto">
                        <pre><code>{activeSessionCard.codeSnippet}</code></pre>
                      </div>
                    )}

                    {sessionFlipped && activeSessionCard.explanation && (
                      <div className="mt-2 text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                        ⚡ {activeSessionCard.explanation}
                      </div>
                    )}
                  </div>

                  <p className="text-[10px] text-theme-muted font-semibold text-center italic">
                    {sessionFlipped ? 'Click card to see question' : 'Click card to flip answer'}
                  </p>
                </div>

                {/* Rating Action Buttons */}
                {sessionFlipped ? (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    <button
                      onClick={() => handleNextSessionCard(1)}
                      className="py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition flex flex-col items-center cursor-pointer"
                    >
                      <span>🔴 Again</span>
                      <span className="text-[9px] opacity-70">1d reset</span>
                    </button>
                    <button
                      onClick={() => handleNextSessionCard(2)}
                      className="py-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-400 font-bold text-xs hover:bg-amber-500/20 transition flex flex-col items-center cursor-pointer"
                    >
                      <span>🟠 Hard</span>
                      <span className="text-[9px] opacity-70">Review 2d</span>
                    </button>
                    <button
                      onClick={() => handleNextSessionCard(3)}
                      className="py-2.5 rounded-xl border border-sky-500/40 bg-sky-500/10 text-sky-400 font-bold text-xs hover:bg-sky-500/20 transition flex flex-col items-center cursor-pointer"
                    >
                      <span>🟢 Good</span>
                      <span className="text-[9px] opacity-70">Review 4d</span>
                    </button>
                    <button
                      onClick={() => handleNextSessionCard(5)}
                      className="py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow transition flex flex-col items-center cursor-pointer"
                    >
                      <span>⚡ Easy</span>
                      <span className="text-[9px] opacity-90">Mastered</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setSessionFlipped(true)}
                    className="w-full py-3 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow transition cursor-pointer"
                  >
                    Reveal Answer & Code Solution
                  </button>
                )}
              </div>
            ) : (
              <div className="py-10 text-center space-y-3">
                <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-extrabold text-theme-main">All Revision Cards Mastered!</h4>
                <p className="text-xs text-theme-muted">You have finished your spaced repetition review session.</p>
                <button
                  onClick={() => setIsRevisionSessionActive(false)}
                  className="px-5 py-2.5 rounded-xl bg-theme-accent text-white font-bold text-xs shadow cursor-pointer"
                >
                  Done Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New AI / Manual Flashcard Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl border border-theme-border bg-theme-card shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-theme-main flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-theme-accent" /> New Flashcard
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-theme-muted hover:text-theme-main cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tab Selector */}
            <div className="flex items-center p-1 rounded-2xl bg-theme-surface border border-theme-border text-xs font-semibold">
              <button
                onClick={() => setModalTab('ai')}
                className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  modalTab === 'ai'
                    ? 'bg-theme-accent text-white shadow-sm font-bold'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Generate from Notes (AI)</span>
              </button>
              <button
                onClick={() => setModalTab('manual')}
                className={`flex-1 py-2 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                  modalTab === 'manual'
                    ? 'bg-theme-accent text-white shadow-sm font-bold'
                    : 'text-theme-muted hover:text-theme-main'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                <span>Manual Entry</span>
              </button>
            </div>

            {modalTab === 'ai' ? (
              <form onSubmit={handleGenerateAiCard} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-theme-muted mb-1 block">Select Study Note (Optional)</label>
                  <CustomSelect
                    value={selectedNoteId}
                    onChange={(e) => setSelectedNoteId(e.target.value)}
                    options={[
                      { value: '', label: '-- Auto Detect / Custom Topic --' },
                      ...(notes || []).map((n: any) => ({
                        value: n.id || n._id,
                        label: `${n.title} (${n.category || 'General'})`
                      }))
                    ]}
                    variant="default"
                    size="sm"
                    fullWidth
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-theme-muted mb-1 block">Or Enter Topic / Problem Statement</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g. Dynamic Programming Knapsack 0/1 optimization"
                    className="w-full p-3 rounded-xl border border-theme-border bg-theme-surface text-xs font-semibold text-theme-main outline-none focus:border-theme-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-theme-muted mb-1 block">Target Algorithm Pattern</label>
                  <CustomSelect
                    value={newPattern}
                    onChange={(e) => setNewPattern(e.target.value)}
                    options={dsaPatterns.map(p => ({ value: p.name, label: p.name }))}
                    variant="default"
                    size="sm"
                    fullWidth
                  />
                </div>

                <div className="p-3 rounded-2xl bg-theme-accent-light/50 border border-theme-accent/30 text-[11px] text-theme-muted flex items-start space-x-2">
                  <Bot className="h-4 w-4 text-theme-accent shrink-0 mt-0.5" />
                  <span>
                    Google Gemini AI will analyze your study note and construct a high-yield flashcard with Q&A, Optimal Solution Code, and Complexity limits!
                  </span>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-theme-border text-xs font-bold text-theme-muted hover:text-theme-main cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="px-5 py-2 rounded-xl bg-gradient-dual hover:opacity-90 text-white text-xs font-bold shadow flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Generating AI Card...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-amber-400" />
                        <span>✨ Generate AI Flashcard</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateManualFlashcard} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-theme-muted mb-1 block">Algorithm Pattern</label>
                  <CustomSelect
                    value={newPattern}
                    onChange={(e) => setNewPattern(e.target.value)}
                    options={dsaPatterns.map(p => ({ value: p.name, label: p.name }))}
                    variant="default"
                    size="sm"
                    fullWidth
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-theme-muted mb-1 block">Question / Concept</label>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="e.g. When should you use the Sliding Window pattern?"
                    rows={2}
                    required
                    className="w-full p-3 rounded-xl border border-theme-border bg-theme-surface text-xs font-semibold text-theme-main outline-none focus:border-theme-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-theme-muted mb-1 block">Answer Key / Intuition</label>
                  <textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="e.g. Use for contiguous subarrays or subsegments."
                    rows={3}
                    required
                    className="w-full p-3 rounded-xl border border-theme-border bg-theme-surface text-xs font-semibold text-theme-main outline-none focus:border-theme-accent"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-theme-muted mb-1 block">Optional Code Snippet</label>
                  <textarea
                    value={newCodeSnippet}
                    onChange={(e) => setNewCodeSnippet(e.target.value)}
                    placeholder="e.g. let left = 0; for (let right = 0; right < n; right++) { ... }"
                    rows={2}
                    className="w-full p-3 rounded-xl border border-theme-border bg-slate-950 font-mono text-[11px] text-emerald-400 outline-none focus:border-theme-accent"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-theme-border text-xs font-bold text-theme-muted hover:text-theme-main cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-bold cursor-pointer"
                  >
                    Save Flashcard
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* New Pattern Modal */}
      {isAddPatternModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-3xl border border-theme-border bg-theme-card shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <h3 className="text-base font-extrabold text-theme-main flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-theme-accent" /> Add New Algorithm Pattern
              </h3>
              <button
                onClick={() => setIsAddPatternModalOpen(false)}
                className="p-1 rounded-xl text-theme-muted hover:text-theme-main cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePattern} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-theme-muted mb-1 block">Pattern Name / Category</label>
                <input
                  type="text"
                  value={patternNameInput}
                  onChange={(e) => setPatternNameInput(e.target.value)}
                  placeholder="e.g. Trie & Prefix Tree, Segment Tree"
                  required
                  className="w-full p-3 rounded-xl border border-theme-border bg-theme-surface text-xs font-semibold text-theme-main outline-none focus:border-theme-accent"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-theme-muted mb-1 block">Description & Key Intuition</label>
                <textarea
                  value={patternDescInput}
                  onChange={(e) => setPatternDescInput(e.target.value)}
                  placeholder="e.g. Efficient tree structure for prefix lookup and autocomplete."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-theme-border bg-theme-surface text-xs font-semibold text-theme-main outline-none focus:border-theme-accent"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-theme-muted mb-1 block">Solved</label>
                  <input
                    type="number"
                    value={patternSolvedInput}
                    onChange={(e) => setPatternSolvedInput(Number(e.target.value))}
                    min={0}
                    className="w-full p-2.5 rounded-xl border border-theme-border bg-theme-surface text-xs font-semibold text-theme-main outline-none focus:border-theme-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-theme-muted mb-1 block">Target Total</label>
                  <input
                    type="number"
                    value={patternTotalInput}
                    onChange={(e) => setPatternTotalInput(Number(e.target.value))}
                    min={1}
                    className="w-full p-2.5 rounded-xl border border-theme-border bg-theme-surface text-xs font-semibold text-theme-main outline-none focus:border-theme-accent"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-theme-muted mb-1 block">Difficulty</label>
                  <CustomSelect
                    value={patternDifficultyInput}
                    onChange={(e) => setPatternDifficultyInput(e.target.value)}
                    options={['Easy', 'Easy - Medium', 'Medium', 'Medium - Hard', 'Hard']}
                    variant="default"
                    size="sm"
                    fullWidth
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPatternModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-theme-border text-xs font-bold text-theme-muted hover:text-theme-main cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-bold shadow cursor-pointer"
                >
                  Create Pattern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DSARevision;
