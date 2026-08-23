import { FlashcardModel } from '../models/flashcard-model';
import { NoteModel } from '../models/note-model';
import { IFlashcard } from '../types/flashcard-types';
import { NotFoundError, BadRequestError } from '../utils/app-error-util';

export const getAllFlashcardsService = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '100', 10);
  const skip = (page - 1) * limit;

  const filter: any = { userId };
  if (query.category) filter.category = query.category;
  if (query.deck) filter.deck = query.deck;
  if (query.pattern) filter.pattern = query.pattern;
  if (query.needsRevision !== undefined) filter.needsRevision = query.needsRevision === 'true';

  const [flashcards, total] = await Promise.all([
    FlashcardModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    FlashcardModel.countDocuments(filter),
  ]);

  const sanitizedCards = flashcards.map((f) => {
    const obj = f.toObject();
    return { ...obj, _id: f._id.toString(), id: f._id.toString() };
  });

  return { flashcards: sanitizedCards, page, limit, total };
};

export const generateAiFlashcardService = async (
  userId: string,
  payload: { noteId?: string; noteContent?: string; topic?: string; pattern?: string }
) => {
  let contentToAnalyze = payload.noteContent || payload.topic || '';
  let noteTitle = payload.topic || 'DSA Study Note';

  if (payload.noteId) {
    const note = await NoteModel.findOne({ _id: payload.noteId, userId });
    if (note) {
      noteTitle = note.title;
      contentToAnalyze = `Title: ${note.title}\n\nContent:\n${note.content || ''}\nCategory: ${note.category || ''}`;
    }
  }

  if (!contentToAnalyze.trim()) {
    throw new BadRequestError('Please provide noteId, noteContent, or topic for AI flashcard generation.');
  }

  let generatedData: {
    question: string;
    answer: string;
    pattern: string;
    difficulty: string;
    codeSnippet: string;
    explanation: string;
  } | null = null;

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are a Senior Technical Interviewer & Computer Science Professor.
Generate a structured DSA revision flashcard based on the following study note or algorithmic topic.

Study Material:
---
${contentToAnalyze}
---
User Preferred Pattern Category: ${payload.pattern || 'Auto-detect'}

Return ONLY a valid raw JSON object (no markdown codeblock wrapping, no extra prose) with this exact JSON structure:
{
  "question": "A concise, high-yield algorithmic or conceptual question",
  "answer": "Detailed step-by-step optimal intuition & algorithm explanation",
  "pattern": "One of: Two Pointers, Sliding Window, Binary Search, Dynamic Programming, Backtracking, Graphs & BFS/DFS, Trees & Tries, System Design & Distributed Data",
  "difficulty": "Easy" | "Medium" | "Hard",
  "codeSnippet": "Clean code solution in JavaScript/TypeScript demonstrating the optimal approach",
  "explanation": "Time Complexity and Space Complexity analysis (e.g., O(N) time | O(1) space)"
}`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (res.ok) {
        const jsonRes = await res.json();
        const rawText = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        const cleanedText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        generatedData = JSON.parse(cleanedText);
      }
    } catch (e) {
      console.warn('[AI_FLASHCARD] Gemini API call error, using smart AI fallback parser:', e);
    }
  }

  if (!generatedData) {
    const isDP = /dynamic|memo|tabulat|knapsack|fibonacci/i.test(contentToAnalyze);
    const isGraph = /graph|bfs|dfs|tree|trie|dijkstra|topological/i.test(contentToAnalyze);
    const isPointer = /pointer|two pointer|sliding window|array|substring/i.test(contentToAnalyze);
    const isSearch = /binary search|sorted|logarithmic/i.test(contentToAnalyze);

    let pattern = payload.pattern || 'Two Pointers';
    if (isDP) pattern = 'Dynamic Programming';
    else if (isGraph) pattern = 'Graphs & BFS/DFS';
    else if (isSearch) pattern = 'Binary Search';
    else if (isPointer) pattern = 'Sliding Window';

    const snippetMatch = contentToAnalyze.match(/```[a-z]*\n([\s\S]*?)```/) || contentToAnalyze.match(/(function|const|let|def|class)[\s\S]{10,200}/);
    const extractedCode = snippetMatch ? (snippetMatch[1] || snippetMatch[0]) : `function solve(input) {\n  // Optimal ${pattern} approach for ${noteTitle}\n  let result = 0;\n  return result;\n}`;

    generatedData = {
      question: `How do you optimize problem solving using the ${pattern} technique for '${noteTitle}'?`,
      answer: `Identify invariants, define boundary conditions, and apply optimal state transitions. For ${noteTitle}, reduce brute-force redundant checks by tracking current state dynamically.`,
      pattern,
      difficulty: isDP || isGraph ? 'Hard' : 'Medium',
      codeSnippet: extractedCode,
      explanation: 'Time Complexity: O(N) | Space Complexity: O(1) optimal space'
    };
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const newFlashcard = await FlashcardModel.create({
    question: generatedData.question,
    front: generatedData.question,
    answer: generatedData.answer,
    back: generatedData.answer,
    pattern: generatedData.pattern || payload.pattern || 'Two Pointers',
    codeSnippet: generatedData.codeSnippet,
    explanation: generatedData.explanation,
    difficulty: generatedData.difficulty || 'Medium',
    category: 'DSA',
    deck: 'DSA',
    needsRevision: true,
    isAiGenerated: true,
    lastReviewed: todayStr,
    nextReviewDate: todayStr,
    noteId: payload.noteId ? payload.noteId : undefined,
    userId,
  });

  const obj = newFlashcard.toObject();
  return { ...obj, _id: newFlashcard._id.toString(), id: newFlashcard._id.toString() };
};

export const createFlashcardService = async (userId: string, payload: Partial<IFlashcard>): Promise<IFlashcard> => {
  const q = payload.question || payload.front;
  const a = payload.answer || payload.back;

  if (!q || !a) {
    throw new BadRequestError('Both question/front and answer/back are required.');
  }

  const cat = payload.category || payload.deck || 'DSA';
  const todayStr = new Date().toISOString().split('T')[0];

  const newCard = await FlashcardModel.create({
    ...payload,
    question: q,
    front: q,
    answer: a,
    back: a,
    pattern: payload.pattern || 'Two Pointers',
    codeSnippet: payload.codeSnippet,
    explanation: payload.explanation,
    category: cat,
    deck: cat,
    lastReviewed: todayStr,
    nextReviewDate: todayStr,
    nextReview: todayStr,
    userId,
  });

  const obj = newCard.toObject();
  return { ...obj, _id: newCard._id.toString(), id: newCard._id.toString() };
};

export const getFlashcardByIdService = async (userId: string, id: string): Promise<IFlashcard> => {
  const card = await FlashcardModel.findOne({ _id: id, userId });
  if (!card) {
    throw new NotFoundError(`Flashcard not found with ID: ${id}`);
  }

  const obj = card.toObject();
  return { ...obj, _id: card._id.toString(), id: card._id.toString() };
};

export const updateFlashcardService = async (userId: string, id: string, payload: Partial<IFlashcard>): Promise<IFlashcard> => {
  const todayStr = new Date().toISOString().split('T')[0];

  const card = await FlashcardModel.findOneAndUpdate(
    { _id: id, userId },
    { ...payload, lastReviewed: todayStr },
    { new: true, runValidators: true }
  );

  if (!card) {
    throw new NotFoundError(`Flashcard not found with ID: ${id}`);
  }

  const obj = card.toObject();
  return { ...obj, _id: card._id.toString(), id: card._id.toString() };
};

export const toggleFlashcardRevisionService = async (userId: string, id: string): Promise<IFlashcard> => {
  const card = await FlashcardModel.findOne({ _id: id, userId });
  if (!card) {
    throw new NotFoundError(`Flashcard not found with ID: ${id}`);
  }

  const todayStr = new Date().toISOString().split('T')[0];
  card.needsRevision = !card.needsRevision;
  card.lastReviewed = todayStr;

  await card.save();

  const obj = card.toObject();
  return { ...obj, _id: card._id.toString(), id: card._id.toString() };
};

export const deleteFlashcardService = async (userId: string, id: string): Promise<void> => {
  const card = await FlashcardModel.findOneAndDelete({ _id: id, userId });
  if (!card) {
    throw new NotFoundError(`Flashcard not found with ID: ${id}`);
  }
};
