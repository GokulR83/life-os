import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Badge } from '../components/common/Badge';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
import { CustomDatePicker } from '../components/common/CustomDatePicker';
import { CustomSelect } from '../components/common/CustomSelect';
import { formatDateDisplay } from '../utils/dateUtils';
import {
  BookOpen,
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Brain,
  Activity,
  Smile,
  BatteryLow,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  Edit2,
  Filter,
  Check,
  X
} from 'lucide-react';

export const Journal = () => {
  const {
    journalEntries,
    fetchJournalsApi,
    addJournalEntryApi,
    updateJournalEntryApi,
    deleteJournalEntryApi
  } = useData();

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Calendar month state
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  // Filter & Pagination state
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Form states
  const [selectedMoodId, setSelectedMoodId] = useState('productive');
  const [selectedMoodLabel, setSelectedMoodLabel] = useState('Productive & Focused');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryText, setEntryText] = useState('');
  const [winsList, setWinsList] = useState<string[]>([]);
  const [blockersList, setBlockersList] = useState<string[]>([]);
  const [newWinInput, setNewWinInput] = useState('');
  const [newBlockerInput, setNewBlockerInput] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (fetchJournalsApi) {
      fetchJournalsApi();
    }
  }, []);

  const moods = [
    { id: 'productive', label: 'Productive & Focused', icon: Zap },
    { id: 'learning', label: 'Deep Learning', icon: Brain },
    { id: 'energy', label: 'High Energy', icon: Activity },
    { id: 'calm', label: 'Calm & Steady', icon: Smile },
    { id: 'exhausted', label: 'Exhausted', icon: BatteryLow }
  ];

  const getMoodIcon = (moodId: string) => {
    const found = moods.find((m) => m.id === moodId || m.label === moodId);
    if (found) {
      const IconComponent = found.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Zap className="h-4 w-4" />;
  };

  // Find active entry matching selected date or selected entry ID
  const activeEntry = (journalEntries || []).find((e: any) =>
    (selectedEntryId && (e.id === selectedEntryId || e._id === selectedEntryId)) || e.date === selectedDate
  ) || (journalEntries || [])[0];

  // Set default selectedEntryId when entries load
  useEffect(() => {
    if (activeEntry && !selectedEntryId) {
      setSelectedEntryId(activeEntry.id || activeEntry._id);
    }
  }, [journalEntries]);

  // Handle date change from Calendar or CustomDatePicker
  const handleSelectDate = (dateStr: string) => {
    if (!dateStr) return;
    setSelectedDate(dateStr);
    const existing = (journalEntries || []).find((e: any) => e.date === dateStr);
    if (existing) {
      setSelectedEntryId(existing.id || existing._id);
    } else {
      setSelectedEntryId(null);
      resetForm();
    }
  };

  const resetForm = () => {
    setEntryTitle('');
    setEntryText('');
    setWinsList([]);
    setBlockersList([]);
    setNewWinInput('');
    setNewBlockerInput('');
    setSelectedMoodId('productive');
    setSelectedMoodLabel('Productive & Focused');
    setEditingEntryId(null);
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntryId(entry.id || entry._id);
    setSelectedDate(entry.date);
    setEntryTitle(entry.title || '');
    setEntryText(entry.entry || entry.content || '');
    const winItems = entry.wins || entry.keyWins || (entry.highlight ? [entry.highlight] : []);
    const blockerItems = entry.blockers || entry.challenges || [];
    setWinsList(Array.isArray(winItems) ? winItems : (winItems ? [winItems] : []));
    setBlockersList(Array.isArray(blockerItems) ? blockerItems : (blockerItems ? [blockerItems] : []));
    setNewWinInput('');
    setNewBlockerInput('');
    setSelectedMoodId(entry.mood || 'productive');
    setSelectedMoodLabel(entry.moodLabel || 'Productive & Focused');
  };

  const handleAddWin = () => {
    const trimmed = newWinInput.trim();
    if (trimmed) {
      if (!winsList.includes(trimmed)) {
        setWinsList((prev) => [...prev, trimmed]);
      }
      setNewWinInput('');
    }
  };

  const handleRemoveWin = (idxToRemove: number) => {
    setWinsList((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleAddBlocker = () => {
    const trimmed = newBlockerInput.trim();
    if (trimmed) {
      if (!blockersList.includes(trimmed)) {
        setBlockersList((prev) => [...prev, trimmed]);
      }
      setNewBlockerInput('');
    }
  };

  const handleRemoveBlocker = (idxToRemove: number) => {
    setBlockersList((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleDeleteClick = (entry: any) => {
    const eId = entry.id || entry._id;
    setDeleteTarget({ id: eId, title: entry.title || entry.date || 'Journal Entry' });
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget && deleteJournalEntryApi) {
      await deleteJournalEntryApi(deleteTarget.id);
    }
    setDeleteTarget(null);
    setSelectedEntryId(null);
  };

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle.trim() || !entryText.trim()) return;

    setSubmitting(true);

    let finalWins = [...winsList];
    if (newWinInput.trim() && !finalWins.includes(newWinInput.trim())) {
      finalWins.push(newWinInput.trim());
    }

    let finalBlockers = [...blockersList];
    if (newBlockerInput.trim() && !finalBlockers.includes(newBlockerInput.trim())) {
      finalBlockers.push(newBlockerInput.trim());
    }

    const payload = {
      date: selectedDate,
      mood: selectedMoodId,
      moodLabel: selectedMoodLabel,
      title: entryTitle.trim(),
      entry: entryText.trim(),
      content: entryText.trim(),
      wins: finalWins,
      keyWins: finalWins,
      blockers: finalBlockers,
      challenges: finalBlockers
    };

    if (editingEntryId) {
      if (updateJournalEntryApi) {
        await updateJournalEntryApi(editingEntryId, payload);
      }
    } else {
      if (addJournalEntryApi) {
        const saved = await addJournalEntryApi(payload);
        if (saved) {
          setSelectedEntryId(saved.id || saved._id);
        }
      }
    }

    setSubmitting(false);
    resetForm();
  };

  // Calendar Days calculation
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const formatCalDate = (dayNum: number) => {
    const mStr = String(month + 1).padStart(2, '0');
    const dStr = String(dayNum).padStart(2, '0');
    return `${year}-${mStr}-${dStr}`;
  };

  const datesWithEntries = new Set((journalEntries || []).map((e: any) => e.date));

  // Extract all available months from journal entries
  const monthOptions = Array.from(
    new Set(
      (journalEntries || []).map((e: any) => {
        if (!e.date) return null;
        const parts = e.date.split('-');
        if (parts.length < 2) return null;
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
        return d.toLocaleString('default', { month: 'long', year: 'numeric' });
      }).filter(Boolean)
    )
  );

  // Filter logs by month filter and search term
  const filteredLog = (journalEntries || []).filter((e: any) => {
    if (selectedMonthFilter !== 'All' && e.date) {
      const parts = e.date.split('-');
      if (parts.length >= 2) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
        const mStr = d.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (mStr !== selectedMonthFilter) return false;
      }
    }

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (e.title || '').toLowerCase().includes(term) ||
      (e.entry || e.content || '').toLowerCase().includes(term) ||
      (e.date || '').includes(term)
    );
  });

  const PAGE_SIZE = 5;
  const totalPages = Math.ceil(filteredLog.length / PAGE_SIZE) || 1;
  const paginatedLog = filteredLog.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Calendar Navigation & Paginated Log */}
      <div className="space-y-5">
        {/* Interactive Mini Calendar Widget */}
        <div className="p-5 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-5 w-5 text-theme-accent" />
              <h3 className="text-sm font-extrabold text-theme-main">
                {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                className="p-1.5 rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-surface transition cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                className="p-1.5 rounded-lg text-theme-muted hover:text-theme-main hover:bg-theme-surface transition cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of week header */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-theme-muted uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-xs font-semibold">
            {calendarDays.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} className="h-8" />;
              }

              const dStr = formatCalDate(dayNum);
              const isSelected = selectedDate === dStr;
              const hasEntry = datesWithEntries.has(dStr);

              return (
                <button
                  key={dStr}
                  onClick={() => handleSelectDate(dStr)}
                  className={`h-8 rounded-xl flex flex-col items-center justify-center transition cursor-pointer relative ${
                    isSelected
                      ? 'bg-theme-accent text-white font-bold shadow-md'
                      : hasEntry
                      ? 'bg-theme-accent/15 text-theme-accent hover:bg-theme-accent/25 border border-theme-accent/30'
                      : 'text-theme-main hover:bg-theme-surface hover:text-theme-accent'
                  }`}
                >
                  <span>{dayNum}</span>
                  {hasEntry && (
                    <span
                      className={`h-1 w-1 rounded-full absolute bottom-1 ${
                        isSelected ? 'bg-white' : 'bg-theme-accent'
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Footer */}
          <div className="pt-3 border-t border-theme-border flex items-center justify-between text-xs font-semibold">
            <span className="text-theme-muted font-bold">Selected: <span className="text-theme-main">{formatDateDisplay(selectedDate)}</span></span>
            <button
              onClick={() => handleSelectDate(new Date().toISOString().split('T')[0])}
              className="px-2.5 py-1 rounded-lg bg-theme-accent/15 text-theme-accent hover:bg-theme-accent/25 border border-theme-accent/30 transition cursor-pointer font-bold"
            >
              Jump to Today
            </button>
          </div>
        </div>

        {/* Paginated Historical Journal Log with Month Filter */}
        <div className="p-5 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-theme-main flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-theme-accent" />
              Past Journal Log
            </h3>
            <span className="text-[10px] text-theme-muted font-semibold">{filteredLog.length} Total Entries</span>
          </div>

          {/* Month Filter Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-theme-muted font-bold flex items-center gap-1">
              <Filter className="h-3 w-3 text-theme-accent" /> Filter Month:
            </span>
            <CustomSelect
              value={selectedMonthFilter}
              onChange={(e) => {
                setSelectedMonthFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={['All', ...monthOptions]}
              variant="default"
              size="xs"
            />
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-theme-muted absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reflections or keywords..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent font-medium"
            />
          </div>

          {paginatedLog.length === 0 ? (
            <p className="text-xs text-theme-muted text-center py-4 italic">No matching journal logs found.</p>
          ) : (
            <div className="space-y-2">
              {paginatedLog.map((entry: any) => {
                const eId = entry.id || entry._id;
                const isSelected = activeEntry && (activeEntry.id === eId || activeEntry._id === eId);

                return (
                  <div
                    key={eId}
                    onClick={() => {
                      setSelectedEntryId(eId);
                      setSelectedDate(entry.date);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-theme-accent-light border-theme-accent text-theme-main shadow-sm'
                        : 'border-theme-border bg-theme-surface hover:border-theme-accent/60'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1 pr-2">
                      <div className="flex items-center space-x-2">
                        <span className="p-1 rounded-lg bg-theme-accent/10 text-theme-accent shrink-0">
                          {getMoodIcon(entry.mood)}
                        </span>
                        <span className="text-[10px] font-bold text-theme-muted">{formatDateDisplay(entry.date)}</span>
                      </div>
                      <h4 className="text-xs font-bold truncate">{entry.title || 'Untitled Reflection'}</h4>
                      <p className="text-[11px] text-theme-muted line-clamp-1">
                        {entry.entry || entry.content || 'No text written.'}
                      </p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(entry);
                      }}
                      className="p-1 rounded text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100 cursor-pointer shrink-0"
                      title="Delete Journal Entry"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 border-t border-theme-border text-xs text-theme-muted font-semibold">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-2.5 py-1 rounded-lg border border-theme-border bg-theme-surface hover:text-theme-main disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className="px-2.5 py-1 rounded-lg border border-theme-border bg-theme-surface hover:text-theme-main disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right 2 Columns: Reflection Panel & Write Form */}
      <div className="lg:col-span-2 space-y-6">
        {/* Dynamic Reflection Reader Panel */}
        {activeEntry ? (
          <div className="p-6 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-4 relative group">
            <div className="flex items-center justify-between border-b border-theme-border pb-3 flex-wrap gap-2">
              <div className="flex items-center space-x-3">
                <span className="p-2.5 rounded-2xl bg-theme-accent-light text-theme-accent border border-theme-border">
                  {getMoodIcon(activeEntry.mood)}
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-theme-main">{activeEntry.title}</h2>
                  <p className="text-xs text-theme-muted">
                    {formatDateDisplay(activeEntry.date)} &bull; {activeEntry.moodLabel || 'Productive & Focused'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="orange" size="md">
                  Reflection Log
                </Badge>
                <button
                  onClick={() => handleEditEntry(activeEntry)}
                  className="p-1.5 rounded-lg text-theme-muted hover:text-theme-accent hover:bg-theme-surface transition cursor-pointer"
                  title="Edit Reflection"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(activeEntry)}
                  className="p-1.5 rounded-lg text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                  title="Delete Reflection"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-theme-main leading-relaxed whitespace-pre-line font-medium">
              {activeEntry.entry || activeEntry.content || 'No reflection content provided.'}
            </p>

            {/* Dynamic Key Wins & Blockers Lists */}
            {(() => {
              const activeWins = (activeEntry.wins && activeEntry.wins.length > 0)
                ? activeEntry.wins
                : (activeEntry.keyWins && activeEntry.keyWins.length > 0)
                ? activeEntry.keyWins
                : (activeEntry.highlight ? [activeEntry.highlight] : []);

              const activeBlockers = (activeEntry.blockers && activeEntry.blockers.length > 0)
                ? activeEntry.blockers
                : (activeEntry.challenges && activeEntry.challenges.length > 0)
                ? activeEntry.challenges
                : [];

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-theme-border">
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                    <h4 className="text-xs font-extrabold text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Key Wins
                    </h4>
                    {activeWins.length > 0 ? (
                      <ul className="text-xs text-theme-main space-y-1.5 pl-1 font-medium">
                        {activeWins.map((w: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                            <span>{w}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-theme-muted italic">No key wins logged for this date.</p>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1.5">
                    <h4 className="text-xs font-extrabold text-rose-500 flex items-center gap-1.5">
                      <AlertTriangle className="h-4 w-4" /> Challenge / Blocker
                    </h4>
                    {activeBlockers.length > 0 ? (
                      <ul className="text-xs text-theme-main space-y-1.5 pl-1 font-medium">
                        {activeBlockers.map((b: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-theme-muted italic">No blockers logged for this date.</p>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-theme-border bg-theme-card space-y-2">
            <BookOpen className="h-10 w-10 text-theme-muted mx-auto opacity-50" />
            <h3 className="text-base font-bold text-theme-main">No reflection entry for {formatDateDisplay(selectedDate)}</h3>
            <p className="text-xs text-theme-muted">Use the form below to write your daily reflection for this date.</p>
          </div>
        )}

        {/* New / Edit Journal Entry Form */}
        <div className="p-6 rounded-2xl border border-theme-border bg-theme-card shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-theme-accent" />
              <h3 className="text-base font-bold text-theme-main">
                {editingEntryId ? `Edit Reflection (${formatDateDisplay(selectedDate)})` : `Write Reflection for ${formatDateDisplay(selectedDate)}`}
              </h3>
            </div>
            {editingEntryId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-theme-accent font-bold hover:underline cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSaveEntry} className="space-y-4">
            {/* Mood Selector */}
            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-2">Select Mood Tag</label>
              <div className="flex flex-wrap gap-2">
                {moods.map((m) => {
                  const IconComp = m.icon;
                  const isSelected = selectedMoodId === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => {
                        setSelectedMoodId(m.id);
                        setSelectedMoodLabel(m.label);
                      }}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition cursor-pointer ${
                        isSelected
                          ? 'bg-theme-accent text-white border-theme-accent shadow-md'
                          : 'border-theme-border bg-theme-surface text-theme-muted hover:text-theme-main hover:border-theme-accent/40'
                      }`}
                    >
                      <IconComp className="h-4 w-4 shrink-0" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">
                Entry Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Cleared 3 DSA questions & reviewed Stripe notes"
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-theme-muted mb-1">
                Daily Reflection Text <span className="text-rose-400">*</span>
              </label>
              <textarea
                placeholder="How did your focus sessions go? What went well today?"
                value={entryText}
                onChange={(e) => setEntryText(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2 rounded-xl border border-theme-border bg-theme-surface text-xs text-theme-main outline-none focus:border-theme-accent resize-none leading-relaxed font-medium"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Key Wins Chip Manager */}
              <div className="p-4 rounded-xl border border-theme-border bg-theme-surface/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-theme-main flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Key Wins & Achievements
                  </label>
                  <span className="text-[10px] text-theme-muted font-semibold">{winsList.length} Items</span>
                </div>

                {/* Existing Wins Pill Chips */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                  {winsList.map((win, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold shadow-xs group"
                    >
                      <span>{win}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveWin(idx)}
                        className="p-0.5 rounded-md hover:bg-emerald-500/30 text-emerald-400 hover:text-white transition cursor-pointer"
                        title="Remove win"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {winsList.length === 0 && (
                    <span className="text-xs text-theme-muted italic">No key wins added yet. Add items below.</span>
                  )}
                </div>

                {/* Add Win Input Bar */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add a key win (e.g. Cleared 3 DSA questions)..."
                    value={newWinInput}
                    onChange={(e) => setNewWinInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddWin();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-card text-xs text-theme-main outline-none focus:border-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddWin}
                    disabled={!newWinInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-bold transition disabled:opacity-40 cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Blockers Chip Manager */}
              <div className="p-4 rounded-xl border border-theme-border bg-theme-surface/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-theme-main flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-rose-400" />
                    Challenges & Blockers
                  </label>
                  <span className="text-[10px] text-theme-muted font-semibold">{blockersList.length} Items</span>
                </div>

                {/* Existing Blockers Pill Chips */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] items-center">
                  {blockersList.map((blocker, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold shadow-xs group"
                    >
                      <span>{blocker}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlocker(idx)}
                        className="p-0.5 rounded-md hover:bg-rose-500/30 text-rose-400 hover:text-white transition cursor-pointer"
                        title="Remove blocker"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {blockersList.length === 0 && (
                    <span className="text-xs text-theme-muted italic">No blockers added yet. Add items below.</span>
                  )}
                </div>

                {/* Add Blocker Input Bar */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Add a blocker (e.g. Need more sleep)..."
                    value={newBlockerInput}
                    onChange={(e) => setNewBlockerInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddBlocker();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-theme-border bg-theme-card text-xs text-theme-main outline-none focus:border-rose-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddBlocker}
                    disabled={!newBlockerInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-bold transition disabled:opacity-40 cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white font-bold text-xs shadow transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>{editingEntryId ? 'Update Journal Entry' : 'Save Journal Entry'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemTitle={deleteTarget?.title}
        message="Are you sure you want to delete this daily reflection log? This action cannot be undone."
      />
    </div>
  );
};

export default Journal;
