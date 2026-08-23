import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import {
  Search,
  LayoutDashboard,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  FileText,
  BookOpen,
  FolderGit2,
  Briefcase,
  Settings,
  X,
  ArrowRight,
  CheckSquare
} from 'lucide-react';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: (val?: boolean) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { tasks = [], notes = [], flashcards = [], projects = [], jobApplications = [] } = useData();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleCloseModal = () => {
    if (onClose) onClose(false);
    setQuery('');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          handleCloseModal();
        } else if (onClose) {
          onClose(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build searchable index items
  const routeItems = [
    { type: 'Navigation', title: 'Go to Dashboard', subtitle: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { type: 'Navigation', title: 'Go to Trackers & Analytics', subtitle: 'Analytics', path: '/trackers', icon: BarChart3 },
    { type: 'Navigation', title: 'Go to DSA Revision Hub', subtitle: 'Algorithms', path: '/dsa', icon: BrainCircuit },
    { type: 'Navigation', title: 'Go to Planner & Sprint Board', subtitle: 'Execution', path: '/planner', icon: CalendarDays },
    { type: 'Navigation', title: 'Go to Markdown Notes', subtitle: 'Knowledge Base', path: '/notes', icon: FileText },
    { type: 'Navigation', title: 'Go to Daily Journal', subtitle: 'Reflection', path: '/journal', icon: BookOpen },
    { type: 'Navigation', title: 'Go to Projects Portfolio', subtitle: 'Builds', path: '/projects', icon: FolderGit2 },
    { type: 'Navigation', title: 'Go to Job Search Pipeline', subtitle: 'Career', path: '/job-search', icon: Briefcase },
    { type: 'Navigation', title: 'Go to Settings', subtitle: 'Preferences', path: '/settings', icon: Settings }
  ];

  const taskItems = (tasks || []).map((t: any) => ({
    type: 'Task',
    title: t.title,
    subtitle: `${t.category || 'General'} • ${t.priority || 'Medium'} Priority`,
    path: '/planner',
    icon: CheckSquare
  }));

  const noteItems = (notes || []).map((n: any) => ({
    type: 'Note',
    title: n.title,
    subtitle: `${(n.tags || []).join(', ')} • ${n.date || ''}`,
    path: '/notes',
    icon: FileText
  }));

  const flashcardItems = (flashcards || []).map((f: any) => ({
    type: 'Flashcard',
    title: f.question,
    subtitle: `${f.category || 'DSA'} • ${f.pattern || 'Pattern'}`,
    path: '/dsa',
    icon: BrainCircuit
  }));

  const projectItems = (projects || []).map((p: any) => ({
    type: 'Project',
    title: p.name,
    subtitle: `${p.category || 'Build'} • ${(p.techStack || []).join(', ')}`,
    path: '/projects',
    icon: FolderGit2
  }));

  const jobItems = (jobApplications || []).map((j: any) => ({
    type: 'Job',
    title: `${j.company || 'Job'} - ${j.role || 'Role'}`,
    subtitle: `Status: ${j.status} • Applied: ${j.appliedDate || j.dateApplied || ''}`,
    path: '/job-search',
    icon: Briefcase
  }));

  const allItems = [
    ...routeItems,
    ...taskItems,
    ...noteItems,
    ...flashcardItems,
    ...projectItems,
    ...jobItems
  ];

  const filteredItems = query.trim() === ''
    ? routeItems
    : allItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
        item.type.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8);

  const handleSelect = (item: any) => {
    navigate(item.path);
    handleCloseModal();
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCloseModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/70 backdrop-blur-md transition-all"
      onClick={handleCloseModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-3xl border border-theme-border bg-theme-card shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Search Input Bar */}
        <div className="flex items-center space-x-3 px-5 py-4 border-b border-theme-border bg-theme-surface">
          <Search className="h-5 w-5 text-theme-accent shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search tasks, notes, cards..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleListKeyDown}
            className="flex-1 bg-transparent text-sm font-semibold text-theme-main outline-none placeholder-theme-muted"
          />
          <kbd className="px-2 py-0.5 rounded-md bg-theme-card-hover text-[10px] text-theme-muted font-mono border border-theme-border">ESC</kbd>
          <button
            type="button"
            onClick={handleCloseModal}
            className="p-1.5 rounded-xl text-theme-muted hover:text-theme-main hover:bg-theme-card-hover transition cursor-pointer"
            title="Close Search (ESC)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-96 overflow-y-auto space-y-1">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-theme-muted">
              No matching commands or items found for "{query}"
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.type}_${idx}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition ${
                    isSelected
                      ? 'bg-gradient-dual text-white shadow-md'
                      : 'hover:bg-theme-surface text-theme-main'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className={`p-2 rounded-xl border ${isSelected ? 'bg-white/20 border-white/30 text-white' : 'bg-theme-surface border-theme-border text-theme-accent'}`}>
                      <Icon className="h-4 w-4 shrink-0" />
                    </div>
                    <div className="truncate">
                      <p className={`text-xs font-extrabold truncate ${isSelected ? 'text-white' : 'text-theme-main'}`}>
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-theme-muted'}`}>
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${isSelected ? 'bg-white/20 text-white' : 'bg-theme-surface text-theme-muted border border-theme-border'}`}>
                      {item.type}
                    </span>
                    <ArrowRight className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-theme-muted'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2.5 border-t border-theme-border bg-theme-surface flex items-center justify-between text-[11px] text-theme-muted font-medium">
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-theme-card text-[10px] border border-theme-border">↑↓</kbd> to navigate
            <kbd className="px-1.5 py-0.5 rounded bg-theme-card text-[10px] border border-theme-border">↵</kbd> to select
          </span>
          <span className="flex items-center gap-1 text-theme-accent font-bold">
            Ctrl+K Command Center
          </span>
        </div>
      </div>
    </div>
  );
};

