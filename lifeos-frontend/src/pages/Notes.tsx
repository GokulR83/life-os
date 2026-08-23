// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { CustomSelect } from '../components/common/CustomSelect';
import { ConfirmDeleteModal } from '../components/common/ConfirmDeleteModal';
import { formatDateDisplay } from '../utils/dateUtils';
import { getSocket, joinNoteRoom, leaveNoteRoom, emitNoteTyping } from '../services/socketClient';
import {
  FileText,
  Search,
  Plus,
  Tag,
  Folder,
  Zap,
  Check,
  X,
  Eye,
  Edit3,
  Code,
  Copy,
  Columns,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  AlertCircle,
  Loader2,
  Settings,
  Edit2
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

// Custom Markdown Renderer
const formatInlineMarkdown = (text) => {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-extrabold text-theme-main">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 rounded bg-theme-surface border border-theme-border font-mono text-[11px] text-theme-accent">{part.slice(1, -1)}</code>;
    }
    return part;
  });
};

const MarkdownRenderer = ({ content }) => {
  if (!content) return <p className="text-xs text-theme-muted italic">Empty note content...</p>;

  const lines = content.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLang = '';

  lines.forEach((line, idx) => {
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div key={`code-${idx}`} className="my-3 rounded-2xl border border-theme-border bg-theme-surface p-4 shadow-inner overflow-x-auto w-full">
            {codeLang && (
              <div className="text-[10px] font-mono uppercase tracking-wider text-theme-accent mb-2 font-bold flex items-center gap-1">
                <Code className="h-3 w-3" /> {codeLang}
              </div>
            )}
            <pre className="font-mono text-xs text-theme-main leading-relaxed whitespace-pre font-medium">
              {codeBuffer.join('\n')}
            </pre>
          </div>
        );
        codeBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
        codeLang = line.replace('```', '').trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={idx} className="text-xl font-extrabold text-theme-main mt-4 mb-2 pb-1 border-b border-theme-border tracking-tight">
          {line.replace('# ', '')}
        </h1>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={idx} className="text-base font-extrabold text-theme-accent mt-4 mb-2">
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={idx} className="text-sm font-bold text-theme-main mt-3 mb-1">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={idx} className="ml-5 list-disc text-xs text-theme-main leading-relaxed my-1">
          {formatInlineMarkdown(line.substring(2))}
        </li>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote key={idx} className="border-l-4 border-theme-accent pl-3.5 py-1.5 my-2 text-xs italic text-theme-muted bg-theme-surface/50 rounded-r-xl">
          {formatInlineMarkdown(line.replace('> ', ''))}
        </blockquote>
      );
    } else if (line.trim() === '') {
      elements.push(<div key={idx} className="h-2" />);
    } else {
      elements.push(
        <p key={idx} className="text-xs text-theme-main leading-relaxed my-1">
          {formatInlineMarkdown(line)}
        </p>
      );
    }
  });

  return <div className="space-y-1 w-full">{elements}</div>;
};

export const Notes = () => {
  const {
    notes,
    categories,
    flashcards,
    fetchNotesApi,
    addNoteApi,
    updateNoteApi,
    deleteNoteApi,
    addNote,
    updateNote,
    addCategory,
    renameCategoryApi,
    deleteCategoryApi,
    addFlashcard,
    addFlashcardApi,
    updateFlashcardApi
  } = useData();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFolder, setActiveFolder] = useState('All');
  
  // Ref for category pills scroll
  const categoryScrollRef = useRef(null);

  // Workspace Mode: 'preview' | 'split' | 'edit'
  const [viewMode, setViewMode] = useState('preview');
  
  const [newTagInput, setNewTagInput] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Category Manager Modal state
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState('');
  const [renamingCategory, setRenamingCategory] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState('');

  const [flashcardConvertedMsg, setFlashcardConvertedMsg] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);
  const [draftNoticeMsg, setDraftNoticeMsg] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (fetchNotesApi) {
      fetchNotesApi();
    }
  }, []);

  const activeNote = (notes || []).find((n: any) => n.id === selectedNoteId || n._id === selectedNoteId) || (notes || [])[0];

  useEffect(() => {
    if (activeNote && !selectedNoteId) {
      setSelectedNoteId(activeNote.id || activeNote._id);
    }
  }, [notes]);

  // Clear pending debounce timer on note switch or unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [selectedNoteId]);

  // Realtime Socket.io Sync across devices / browser windows
  useEffect(() => {
    if (!activeNote) return;
    const nId = activeNote.id || activeNote._id;
    if (!nId) return;

    joinNoteRoom(nId);
    const socket = getSocket();

    const handleRemoteUpdate = (data: any) => {
      if (data && (data.noteId === nId || data.id === nId || data._id === nId)) {
        updateNote(nId, data);
      }
    };

    socket.on('note:updated', handleRemoteUpdate);

    return () => {
      leaveNoteRoom(nId);
      socket.off('note:updated', handleRemoteUpdate);
    };
  }, [selectedNoteId]);

  // Dynamic Category Calculation
  const presetFolders = ['DSA', 'System Design', 'Frontend', 'Career'];
  const customFolders = (notes || []).map((n) => n.folder || n.category).filter(Boolean);
  const storeCategories = categories || [];
  const activeCategoriesList = Array.from(new Set([...presetFolders, ...storeCategories, ...customFolders]));
  const allFolders = ['All', ...activeCategoriesList];

  // Sidebar Filtered Notes
  const filteredNotes = (notes || []).filter((n) => {
    const matchesFolder = activeFolder === 'All' || n.folder === activeFolder || n.category === activeFolder;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      (n.title || '').toLowerCase().includes(query) ||
      (n.content || '').toLowerCase().includes(query) ||
      (n.tags || []).some((t: string) => t.toLowerCase().includes(query)) ||
      (n.folder || n.category || '').toLowerCase().includes(query);

    return matchesFolder && matchesSearch;
  });

  const handleUpdateNote = (fieldsToUpdate: any) => {
    if (!activeNote) return;
    const nId = activeNote.id || activeNote._id;

    // 1. Instantly update local store so typing has 0 latency
    updateNote(nId, fieldsToUpdate);
    setSaveStatus('saving');

    // 2. Broadcast live typing event over Socket.io WebSockets to other tabs/devices
    emitNoteTyping(nId, fieldsToUpdate);

    // 3. Clear existing debounced timer
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 4. Debounce API call by 750ms for DB persistence
    saveTimeoutRef.current = setTimeout(async () => {
      if (updateNoteApi) {
        const payload = {
          title: fieldsToUpdate.title !== undefined ? fieldsToUpdate.title : activeNote.title,
          content: fieldsToUpdate.content !== undefined ? fieldsToUpdate.content : activeNote.content,
          folder: fieldsToUpdate.folder || activeNote.folder || activeNote.category || 'General',
          category: fieldsToUpdate.category || activeNote.category || activeNote.folder || 'General',
          tags: fieldsToUpdate.tags !== undefined ? fieldsToUpdate.tags : (activeNote.tags || [])
        };
        await updateNoteApi(nId, payload);
      }
      setSaveStatus('saved');
    }, 750);

    // 5. Auto-sync linked flashcard if one exists for this note
    const linkedCard = (flashcards || []).find((f: any) => f.noteId === nId);
    if (linkedCard && updateFlashcardApi) {
      const cardId = linkedCard.id || linkedCard._id;
      updateFlashcardApi(cardId, {
        noteId: nId,
        question: fieldsToUpdate.title !== undefined ? fieldsToUpdate.title : activeNote.title,
        answer: fieldsToUpdate.content !== undefined ? fieldsToUpdate.content : activeNote.content,
        category: fieldsToUpdate.folder || fieldsToUpdate.category || activeNote.folder || activeNote.category || 'DSA',
        pattern: fieldsToUpdate.folder || fieldsToUpdate.category || activeNote.folder || activeNote.category || 'Two Pointers'
      });
    }
  };

  const handleManualSave = async () => {
    if (!activeNote) return;
    const nId = activeNote.id || activeNote._id;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setSaveStatus('saving');
    if (updateNoteApi) {
      await updateNoteApi(nId, {
        title: activeNote.title,
        content: activeNote.content,
        folder: activeNote.folder || activeNote.category || 'General',
        category: activeNote.category || activeNote.folder || 'General',
        tags: activeNote.tags || []
      });
    } else {
      updateNote(nId, { updatedAt: new Date().toISOString() });
    }
    setSaveStatus('saved');
  };

  // Ctrl+S / Cmd+S Keyboard Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeNote]);

  const handleCreateNewNote = async () => {
    // Prevent duplicate draft creation if an unedited untitled note already exists
    const existingDraft = (notes || []).find((n: any) => {
      const titleStr = (n.title || '').trim().toLowerCase();
      const isUntitled = titleStr.startsWith('untitled');
      const isUnmodifiedContent = !n.content || (n.content || '').includes('# Untitled Algorithm Note') || (n.content || '').trim().length < 50;
      return isUntitled && isUnmodifiedContent;
    });

    if (existingDraft) {
      const draftId = existingDraft.id || existingDraft._id;
      setSelectedNoteId(draftId);
      setViewMode('edit');
      setDraftNoticeMsg(true);
      setTimeout(() => setDraftNoticeMsg(false), 3500);
      return;
    }

    const defaultFolder = activeFolder === 'All' ? 'DSA' : activeFolder;

    const payload = {
      title: 'Untitled Algorithm Note',
      folder: defaultFolder,
      category: defaultFolder,
      tags: ['dsa'],
      content: '# Untitled Algorithm Note\n\nWrite code snippets and markdown notes here.\n\n```js\nfunction solve() {\n  return true;\n}\n```'
    };

    if (addNoteApi) {
      const created = await addNoteApi(payload);
      if (created) {
        setSelectedNoteId(created.id || created._id);
      }
    } else {
      addNote(payload);
    }
    setViewMode('edit');
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim() || !activeNote) return;
    const formattedTag = newTagInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    const currentTags = activeNote.tags || [];

    if (!currentTags.includes(formattedTag)) {
      handleUpdateNote({ tags: [...currentTags, formattedTag] });
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!activeNote) return;
    const updatedTags = (activeNote.tags || []).filter((t: string) => t !== tagToRemove);
    handleUpdateNote({ tags: updatedTags });
  };

  const handleAddCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCategoryInput.trim() || !activeNote) return;
    const newCategory = customCategoryInput.trim();
    if (addCategory) {
      addCategory(newCategory);
    }
    handleUpdateNote({ folder: newCategory, category: newCategory });
    setActiveFolder(newCategory);
    setCustomCategoryInput('');
    setIsCreatingCategory(false);
  };

  const handleConvertToFlashcard = async () => {
    if (!activeNote) return;
    const noteId = activeNote.id || activeNote._id;

    // Search for existing flashcard linked to this note
    const existingCard = (flashcards || []).find(
      (f: any) => f.noteId === noteId || (f.question === activeNote.title && f.category === (activeNote.folder || activeNote.category))
    );

    const cardData = {
      noteId,
      question: activeNote.title || 'Note Concept',
      answer: activeNote.content || 'Note Summary',
      category: activeNote.folder || activeNote.category || 'DSA',
      pattern: activeNote.folder || activeNote.category || 'Two Pointers',
      needsRevision: true
    };

    if (existingCard) {
      // 1. DEDUPLICATION & UPDATE: Flashcard already exists! Update question & answer
      const cardId = existingCard.id || existingCard._id;
      if (updateFlashcardApi) {
        await updateFlashcardApi(cardId, cardData);
      }
      setFlashcardConvertedMsg('updated');
    } else {
      // 2. NEW CREATION: Create new linked flashcard
      if (addFlashcardApi) {
        await addFlashcardApi(cardData);
      } else if (addFlashcard) {
        addFlashcard(cardData);
      }
      setFlashcardConvertedMsg('created');
    }

    setTimeout(() => setFlashcardConvertedMsg(false), 3500);
  };

  const handleConfirmDelete = async () => {
    if (deleteTarget) {
      const tId = deleteTarget.id || deleteTarget._id;
      if (deleteNoteApi) {
        await deleteNoteApi(tId);
      }
      if (selectedNoteId === tId) {
        setSelectedNoteId(null);
      }
    }
    setDeleteTarget(null);
  };

  const handleCopyContent = () => {
    if (activeNote?.content) {
      navigator.clipboard.writeText(activeNote.content);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2500);
    }
  };

  const handleScrollLeft = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: -100, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (categoryScrollRef.current) {
      categoryScrollRef.current.scrollBy({ left: 100, behavior: 'smooth' });
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row rounded-3xl border border-theme-border bg-theme-card shadow-lg overflow-hidden w-full">
      {/* 1. Left Sidebar: Minimal Filter & Note List */}
      <div className="w-full md:w-72 border-r border-theme-border flex flex-col bg-theme-surface shrink-0">
        <div className="p-4 border-b border-theme-border space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-theme-main flex items-center gap-2">
              <FileText className="h-4 w-4 text-theme-accent" />
              Notes & Knowledge
            </h3>
            <button
              onClick={handleCreateNewNote}
              className="px-2.5 py-1 rounded-xl bg-theme-accent text-white hover:bg-theme-accent-hover shadow transition cursor-pointer flex items-center space-x-1"
              title="Create New Note"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs font-bold">New</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex items-center px-3.5 py-2 rounded-2xl border border-theme-border bg-theme-card text-xs focus-within:border-theme-accent transition shadow-inner">
            <Search className="h-3.5 w-3.5 text-theme-muted mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search notes or #tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-theme-main w-full placeholder-theme-muted font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-theme-muted hover:text-theme-main p-0.5">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Sleek Minimal Category Pills with Scroll Arrows */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleScrollLeft}
              className="p-1 rounded-lg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-main transition cursor-pointer shrink-0 shadow-sm"
              title="Scroll Left"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <div
              ref={categoryScrollRef}
              className="flex items-center space-x-1 overflow-x-auto pb-0.5 pt-0.5 scrollbar-none flex-1 scroll-smooth"
            >
              {allFolders.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFolder(f)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                    activeFolder === f
                      ? 'bg-theme-accent text-white shadow-sm font-bold'
                      : 'text-theme-muted hover:text-theme-main hover:bg-theme-card-hover'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <button
              onClick={handleScrollRight}
              className="p-1 rounded-lg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-main transition cursor-pointer shrink-0 shadow-sm"
              title="Scroll Right"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => setIsManageCategoriesOpen(true)}
              className="p-1.5 rounded-lg hover:bg-theme-card border border-theme-border text-theme-muted hover:text-theme-accent transition cursor-pointer shrink-0 shadow-sm ml-1"
              title="Manage Categories (Edit / Delete / Add)"
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Note List Items */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => setSelectedNoteId(note.id)}
                className={`p-3 rounded-xl transition cursor-pointer border ${
                  selectedNoteId === note.id
                    ? 'bg-theme-card border-theme-accent shadow-sm'
                    : 'border-transparent hover:bg-theme-card-hover'
                }`}
              >
                <h4 className="text-xs font-bold text-theme-main truncate">{note.title}</h4>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-theme-muted">
                  <span className="flex items-center gap-1 font-semibold text-theme-accent">
                    <Folder className="h-3 w-3" />
                    {note.folder || note.category || 'General'}
                  </span>
                  <span>{formatDateDisplay(note.updatedAt || note.createdAt || note.date)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-theme-muted space-y-2">
              <FileText className="h-6 w-6 mx-auto opacity-40" />
              <p>No notes found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Right Workspace: 100% Full Width */}
      {activeNote ? (
        <div className="flex-1 flex flex-col min-w-0 bg-theme-card w-full h-full overflow-hidden">
          {/* Workspace Top Toolbar */}
          <div className="px-6 py-3.5 border-b border-theme-border flex items-center justify-between flex-wrap gap-3 w-full bg-theme-surface/50">
            {/* Folder & Category Selector */}
            <div className="flex items-center space-x-2">
              <Folder className="h-4 w-4 text-theme-accent shrink-0" />
              {!isCreatingCategory ? (
                <CustomSelect
                  value={activeNote.folder || activeNote.category || 'DSA'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '__CUSTOM__') {
                      setIsCreatingCategory(true);
                    } else if (val === '__MANAGE__') {
                      setIsManageCategoriesOpen(true);
                    } else {
                      handleUpdateNote({ folder: val, category: val });
                    }
                  }}
                  options={[
                    ...activeCategoriesList.map(f => ({ value: f, label: f })),
                    { value: '__CUSTOM__', label: '+ New Category...' },
                    { value: '__MANAGE__', label: '⚙️ Manage Categories...' }
                  ]}
                  variant="default"
                  size="xs"
                  align="left"
                />
              ) : (
                <form onSubmit={handleAddCustomCategory} className="flex items-center space-x-1">
                  <input
                    type="text"
                    placeholder="Category..."
                    value={customCategoryInput}
                    onChange={(e) => setCustomCategoryInput(e.target.value)}
                    className="px-2.5 py-1 rounded-xl border border-theme-accent bg-theme-card text-xs font-bold text-theme-main outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded-xl bg-theme-accent text-white text-xs font-bold shrink-0"
                  >
                    Save
                  </button>
                </form>
              )}

              {/* Realtime Debounced Save Indicator */}
              <div className="flex items-center space-x-1.5 border-l border-theme-border pl-2.5">
                {saveStatus === 'saving' ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
                    <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
                    <span className="hidden sm:inline">Saving...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Realtime Autosave Active" />
                    <span className="hidden sm:inline">Saved to cloud</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right Action Switchers */}
            <div className="flex items-center space-x-2">
              {draftNoticeMsg && (
                <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                  <AlertCircle className="h-3.5 w-3.5" /> Please edit your untitled draft before creating another.
                </span>
              )}
              {flashcardConvertedMsg && (
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  {flashcardConvertedMsg === 'updated' ? 'Flashcard updated with latest note!' : 'Flashcard created & synced!'}
                </span>
              )}
              {copiedMsg && (
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Copied!
                </span>
              )}

              {/* Explicit Save Button */}
              <button
                onClick={handleManualSave}
                className="px-3 py-1.5 rounded-xl bg-theme-accent text-white hover:bg-theme-accent-hover font-semibold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow"
                title="Save changes (Ctrl+S)"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save</span>
              </button>

              {/* View / Split / Edit Mode Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-theme-surface border border-theme-border text-xs font-semibold">
                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-lg transition cursor-pointer ${
                    viewMode === 'preview'
                      ? 'bg-theme-accent text-white font-bold shadow-sm'
                      : 'text-theme-muted hover:text-theme-main'
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-lg transition cursor-pointer ${
                    viewMode === 'split'
                      ? 'bg-theme-accent text-white font-bold shadow-sm'
                      : 'text-theme-muted hover:text-theme-main'
                  }`}
                >
                  <Columns className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Split View</span>
                </button>
                <button
                  onClick={() => setViewMode('edit')}
                  className={`flex items-center space-x-1.5 px-3.5 py-1 rounded-lg transition cursor-pointer ${
                    viewMode === 'edit'
                      ? 'bg-theme-accent text-white font-bold shadow-sm'
                      : 'text-theme-muted hover:text-theme-main'
                  }`}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Note</span>
                </button>
              </div>

              <button
                onClick={handleCopyContent}
                className="px-2.5 py-1.5 rounded-xl border border-theme-border bg-theme-surface hover:bg-theme-card-hover text-theme-muted hover:text-theme-main text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                title="Copy Raw Markdown"
              >
                <Copy className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Copy</span>
              </button>

              <button
                onClick={handleConvertToFlashcard}
                className="px-3 py-1.5 rounded-xl border border-theme-border bg-theme-surface hover:bg-theme-card-hover text-theme-accent font-semibold text-xs transition flex items-center space-x-1.5 cursor-pointer shadow-sm"
              >
                <Zap className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Convert Flashcard</span>
              </button>

              <button
                onClick={() => setDeleteTarget(activeNote)}
                className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-500 transition cursor-pointer"
                title="Delete Note"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Full-Width Workspace Body Pane */}
          <div className="p-6 flex-1 overflow-y-auto space-y-4 w-full">
            {/* Title & Tag Bar */}
            <div className="space-y-3 w-full pb-3 border-b border-theme-border">
              <input
                type="text"
                value={activeNote.title}
                onChange={(e) => handleUpdateNote({ title: e.target.value })}
                placeholder="Note Title..."
                disabled={viewMode === 'preview'}
                className={`w-full text-2xl sm:text-3xl font-extrabold text-theme-main bg-transparent border-none outline-none tracking-tight ${viewMode === 'preview' ? 'cursor-default' : ''}`}
              />

              {/* Tags Bar - No Add Tag options in Preview Mode */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-theme-accent flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5" /> Tags:
                </span>
                {(activeNote.tags || []).length > 0 ? (
                  (activeNote.tags || []).map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-theme-surface border border-theme-border text-[11px] font-mono text-theme-main shadow-sm"
                    >
                      <span className="text-theme-accent">#</span>
                      <span>{t}</span>
                      {viewMode !== 'preview' && (
                        <button
                          onClick={() => handleRemoveTag(t)}
                          className="text-theme-muted hover:text-rose-500 transition cursor-pointer p-0.5"
                          title={`Remove tag #${t}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-theme-muted italic">No tags added</span>
                )}

                {/* Inline Add Tag Form Input - Hidden in Preview Mode */}
                {viewMode !== 'preview' && (
                  <form onSubmit={handleAddTag} className="inline-flex items-center">
                    <div className="flex items-center px-2.5 py-0.5 rounded-lg bg-theme-surface border border-theme-border focus-within:border-theme-accent transition">
                      <span className="text-theme-muted font-mono text-xs pr-1">#</span>
                      <input
                        type="text"
                        placeholder="Add tag..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        className="bg-transparent outline-none text-xs font-mono text-theme-main w-24 placeholder-theme-muted"
                      />
                      <button
                        type="submit"
                        disabled={!newTagInput.trim()}
                        className="text-theme-accent hover:text-theme-accent-hover disabled:opacity-30 cursor-pointer ml-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Dynamic View Modes (100% Full Width) */}
            {viewMode === 'preview' && (
              /* MODE 1: FULL-WIDTH PREVIEW MODE - Clean & Headerless */
              <div className="w-full pt-1">
                <div className="p-6 sm:p-8 rounded-3xl border border-theme-border bg-theme-surface/70 shadow-sm w-full">
                  <MarkdownRenderer content={activeNote.content} />
                </div>
              </div>
            )}

            {viewMode === 'split' && (
              /* MODE 2: SPLIT-VIEW (SIDE-BY-SIDE 50/50 LIVE WORKSPACE) */
              <div className="flex flex-col lg:flex-row gap-4 w-full h-full min-h-[480px]">
                {/* Left Half: Raw Textarea Editor */}
                <div className="w-full lg:w-1/2 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-theme-muted">
                    <span className="flex items-center gap-1 text-theme-accent">
                      <Code className="h-3.5 w-3.5" /> Markdown Source Editor
                    </span>
                  </div>
                  <textarea
                    value={activeNote.content}
                    onChange={(e) => handleUpdateNote({ content: e.target.value })}
                    rows={20}
                    placeholder="Write markdown here..."
                    className="w-full flex-1 p-4 rounded-2xl border border-theme-border bg-theme-surface font-mono text-xs text-theme-main leading-relaxed shadow-inner outline-none focus:border-theme-accent resize-none"
                  />
                </div>

                {/* Right Half: Live Markdown Preview */}
                <div className="w-full lg:w-1/2 flex flex-col space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-theme-muted">
                    <span className="flex items-center gap-1 text-theme-accent">
                      <Eye className="h-3.5 w-3.5" /> Live Rendered Preview
                    </span>
                  </div>
                  <div className="w-full flex-1 p-4 rounded-2xl border border-theme-border bg-theme-surface/70 overflow-y-auto">
                    <MarkdownRenderer content={activeNote.content} />
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'edit' && (
              /* MODE 3: FULL-WIDTH RAW EDITOR MODE */
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-theme-muted">
                  <span className="flex items-center gap-1 text-theme-accent">
                    <Edit3 className="h-3.5 w-3.5" /> Full Width Editor
                  </span>
                  <span>Supports # Headings, ```code```, - lists, & **bold**</span>
                </div>
                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleUpdateNote({ content: e.target.value })}
                  rows={20}
                  placeholder="Write markdown note content here..."
                  className="w-full p-5 rounded-3xl border border-theme-border bg-theme-surface font-mono text-xs text-theme-main outline-none focus:border-theme-accent resize-y leading-relaxed shadow-inner"
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-theme-muted text-sm">
          Select a note to view or edit
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        itemTitle={deleteTarget?.title}
        message="Are you sure you want to delete this note document? This action cannot be undone."
      />

      {/* Manage Categories Modal */}
      {isManageCategoriesOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-3xl border border-theme-border bg-theme-card shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <h3 className="text-base font-bold text-theme-main flex items-center gap-2">
                <Folder className="h-5 w-5 text-theme-accent" /> Manage Note Categories
              </h3>
              <button
                onClick={() => {
                  setIsManageCategoriesOpen(false);
                  setRenamingCategory(null);
                }}
                className="p-1.5 rounded-xl text-theme-muted hover:text-theme-main cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Add Category Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCatInput.trim()) return;
                if (addCategory) {
                  addCategory(newCatInput.trim());
                }
                setActiveFolder(newCatInput.trim());
                setNewCatInput('');
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="New Category Name..."
                value={newCatInput}
                onChange={(e) => setNewCatInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-theme-border bg-theme-surface text-xs font-semibold text-theme-main outline-none focus:border-theme-accent"
              />
              <button
                type="submit"
                disabled={!newCatInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-bold disabled:opacity-40 transition cursor-pointer flex items-center gap-1 shrink-0 shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" /> Add
              </button>
            </form>

            {/* Category List */}
            <div className="max-h-64 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {activeCategoriesList.map((catName) => {
                const noteCount = (notes || []).filter((n: any) => (n.folder || n.category) === catName).length;
                const isEditing = renamingCategory === catName;

                return (
                  <div
                    key={catName}
                    className="flex items-center justify-between p-3 rounded-2xl border border-theme-border bg-theme-surface hover:bg-theme-card-hover transition"
                  >
                    {isEditing ? (
                      <div className="flex items-center space-x-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={renameInputValue}
                          onChange={(e) => setRenameInputValue(e.target.value)}
                          className="flex-1 px-2.5 py-1 rounded-lg border border-theme-accent bg-theme-card text-xs font-bold text-theme-main outline-none"
                          autoFocus
                        />
                        <button
                          onClick={async () => {
                            if (!renameInputValue.trim()) return;
                            if (renameCategoryApi) {
                              await renameCategoryApi(catName, renameInputValue.trim());
                            }
                            if (activeFolder === catName) {
                              setActiveFolder(renameInputValue.trim());
                            }
                            setRenamingCategory(null);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                          title="Save New Name"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setRenamingCategory(null)}
                          className="p-1.5 rounded-lg border border-theme-border text-theme-muted text-xs font-bold cursor-pointer"
                          title="Cancel"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2.5">
                        <Folder className="h-4 w-4 text-theme-accent shrink-0" />
                        <span className="text-xs font-bold text-theme-main">{catName}</span>
                        <span className="text-[10px] font-semibold text-theme-muted bg-theme-card px-2 py-0.5 rounded-md border border-theme-border">
                          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                        </span>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => {
                            setRenamingCategory(catName);
                            setRenameInputValue(catName);
                          }}
                          className="p-1.5 rounded-lg border border-theme-border bg-theme-card hover:bg-theme-accent/10 text-theme-muted hover:text-theme-accent transition cursor-pointer"
                          title={`Rename category ${catName}`}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete category "${catName}"? All ${noteCount} notes in this category will be moved to "DSA".`)) {
                              if (deleteCategoryApi) {
                                await deleteCategoryApi(catName);
                              }
                              if (activeFolder === catName) {
                                setActiveFolder('All');
                              }
                            }
                          }}
                          className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-500 transition cursor-pointer"
                          title={`Delete category ${catName}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end border-t border-theme-border pt-3">
              <button
                onClick={() => {
                  setIsManageCategoriesOpen(false);
                  setRenamingCategory(null);
                }}
                className="px-4 py-2 rounded-xl bg-theme-accent text-white text-xs font-bold cursor-pointer shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;

