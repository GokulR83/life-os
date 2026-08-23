import { JournalModel } from '../models/journal-model';
import { IJournalEntry } from '../types/journal-types';
import { NotFoundError, BadRequestError } from '../utils/app-error-util';

export const getAllJournalsService = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '100', 10);
  const skip = (page - 1) * limit;

  const filter: any = { userId };
  if (query.date) filter.date = query.date;

  const [journals, total] = await Promise.all([
    JournalModel.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(limit),
    JournalModel.countDocuments(filter),
  ]);

  const sanitizedJournals = journals.map((j) => {
    const obj = j.toObject();
    const entryText = j.entry || j.content || j.reflection || '';
    const winsList = j.wins || (j as any).keyWins || (j.highlight ? [j.highlight] : []);
    const blockersList = j.blockers || (j as any).challenges || [];
    return {
      ...obj,
      _id: j._id.toString(),
      id: j._id.toString(),
      entry: entryText,
      content: entryText,
      wins: winsList,
      keyWins: winsList,
      blockers: blockersList,
      challenges: blockersList,
    };
  });

  return { journals: sanitizedJournals, page, limit, total };
};

export const createJournalService = async (userId: string, payload: Partial<IJournalEntry>): Promise<IJournalEntry> => {
  const dateStr = payload.date || new Date().toISOString().split('T')[0];
  const winsPayload = payload.wins || (payload as any).keyWins || [];
  const blockersPayload = payload.blockers || (payload as any).challenges || [];
  const entryText = payload.entry || payload.content || payload.reflection || '';

  const journal = await JournalModel.findOneAndUpdate(
    { userId, date: dateStr },
    {
      ...payload,
      userId,
      date: dateStr,
      entry: entryText,
      content: entryText,
      wins: winsPayload,
      keyWins: winsPayload,
      blockers: blockersPayload,
      challenges: blockersPayload,
    },
    { new: true, upsert: true, runValidators: true }
  );

  const obj = journal.toObject();
  const resEntryText = journal.entry || journal.content || journal.reflection || '';
  const winsList = (journal.wins && journal.wins.length) ? journal.wins : (journal as any).keyWins || [];
  const blockersList = (journal.blockers && journal.blockers.length) ? journal.blockers : (journal as any).challenges || [];

  return {
    ...obj,
    _id: journal._id.toString(),
    id: journal._id.toString(),
    entry: resEntryText,
    content: resEntryText,
    wins: winsList,
    keyWins: winsList,
    blockers: blockersList,
    challenges: blockersList,
  };
};

export const getJournalByIdService = async (userId: string, id: string): Promise<IJournalEntry> => {
  const journal = await JournalModel.findOne({ _id: id, userId });
  if (!journal) {
    throw new NotFoundError(`Journal entry not found with ID: ${id}`);
  }

  const obj = journal.toObject();
  const entryText = journal.entry || journal.content || journal.reflection || '';
  const winsList = (journal.wins && journal.wins.length) ? journal.wins : (journal as any).keyWins || [];
  const blockersList = (journal.blockers && journal.blockers.length) ? journal.blockers : (journal as any).challenges || [];

  return {
    ...obj,
    _id: journal._id.toString(),
    id: journal._id.toString(),
    entry: entryText,
    content: entryText,
    wins: winsList,
    keyWins: winsList,
    blockers: blockersList,
    challenges: blockersList,
  };
};

export const updateJournalService = async (userId: string, id: string, payload: Partial<IJournalEntry>): Promise<IJournalEntry> => {
  const winsPayload = payload.wins || (payload as any).keyWins;
  const blockersPayload = payload.blockers || (payload as any).challenges;

  const updateDoc: any = { ...payload };
  if (winsPayload !== undefined) {
    updateDoc.wins = winsPayload;
    updateDoc.keyWins = winsPayload;
  }
  if (blockersPayload !== undefined) {
    updateDoc.blockers = blockersPayload;
    updateDoc.challenges = blockersPayload;
  }

  const journal = await JournalModel.findOneAndUpdate({ _id: id, userId }, updateDoc, {
    new: true,
    runValidators: true,
  });

  if (!journal) {
    throw new NotFoundError(`Journal entry not found with ID: ${id}`);
  }

  const obj = journal.toObject();
  const entryText = journal.entry || journal.content || journal.reflection || '';
  const winsList = journal.wins || (journal as any).keyWins || [];
  const blockersList = journal.blockers || (journal as any).challenges || [];

  return {
    ...obj,
    _id: journal._id.toString(),
    id: journal._id.toString(),
    entry: entryText,
    content: entryText,
    wins: winsList,
    keyWins: winsList,
    blockers: blockersList,
    challenges: blockersList,
  };
};

export const deleteJournalService = async (userId: string, id: string): Promise<void> => {
  const journal = await JournalModel.findOneAndDelete({ _id: id, userId });
  if (!journal) {
    throw new NotFoundError(`Journal entry not found with ID: ${id}`);
  }
};
