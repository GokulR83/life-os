import { UserModel } from '../models/user-model';
import { IUser } from '../types/user-types';
import { NotFoundError } from '../utils/app-error-util';

export const getAllUsersService = async (query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '10', 10);
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (query.role) filter.role = query.role;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    UserModel.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    UserModel.countDocuments(filter),
  ]);

  const sanitizedUsers = users.map((u) => {
    const obj = u.toObject();
    delete obj.password;
    return { ...obj, _id: u._id.toString() };
  });

  return { users: sanitizedUsers, page, limit, total };
};

export const getUserByIdService = async (id: string): Promise<Omit<IUser, 'password'>> => {
  const user = await UserModel.findById(id);
  if (!user) {
    throw new NotFoundError(`User not found with ID: ${id}`);
  }

  const obj = user.toObject();
  delete obj.password;
  return { ...obj, _id: user._id.toString() };
};

export const updateUserService = async (id: string, payload: Partial<IUser>): Promise<Omit<IUser, 'password'>> => {
  // Prevent password update via general user endpoint
  delete (payload as any).password;

  const user = await UserModel.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
  if (!user) {
    throw new NotFoundError(`User not found with ID: ${id}`);
  }

  const obj = user.toObject();
  delete obj.password;
  return { ...obj, _id: user._id.toString() };
};

export const exportUserDataService = async (userId: string) => {
  const { TaskModel } = await import('../models/task-model');
  const { HabitModel } = await import('../models/habit-model');
  const { StudyModel } = await import('../models/study-model');
  const { JobModel } = await import('../models/job-model');
  const { ExpenseModel } = await import('../models/expense-model');
  const { FlashcardModel } = await import('../models/flashcard-model');
  const { NoteModel } = await import('../models/note-model');
  const { JournalModel } = await import('../models/journal-model');
  const { ProjectModel } = await import('../models/project-model');
  const { DsaModel } = await import('../models/dsa-model');
  const { ResumeModel } = await import('../models/resume-model');

  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundError('User not found.');

  const [
    tasks,
    habits,
    studySessions,
    jobApplications,
    expenses,
    flashcards,
    notes,
    journalEntries,
    projects,
    dsaPatterns,
    resumeVersions,
  ] = await Promise.all([
    TaskModel.find({ userId }),
    HabitModel.find({ userId }),
    StudyModel.find({ userId }),
    JobModel.find({ userId }),
    ExpenseModel.find({ userId }),
    FlashcardModel.find({ userId }),
    NoteModel.find({ userId }),
    JournalModel.find({ userId }),
    ProjectModel.find({ userId }),
    DsaModel.find({ userId }),
    ResumeModel.find({ userId }),
  ]);

  const userObj = user.toObject();
  delete userObj.password;

  return {
    exportedAt: new Date().toISOString(),
    user: userObj,
    tasks,
    habits,
    studySessions,
    jobApplications,
    expenses,
    flashcards,
    notes,
    journalEntries,
    projects,
    dsaPatterns,
    resumeVersions,
  };
};

export const importUserDataService = async (userId: string, dataPayload: any) => {
  const { TaskModel } = await import('../models/task-model');
  const { HabitModel } = await import('../models/habit-model');
  const { StudyModel } = await import('../models/study-model');
  const { JobModel } = await import('../models/job-model');
  const { ExpenseModel } = await import('../models/expense-model');
  const { FlashcardModel } = await import('../models/flashcard-model');
  const { NoteModel } = await import('../models/note-model');
  const { JournalModel } = await import('../models/journal-model');
  const { ProjectModel } = await import('../models/project-model');
  const { DsaModel } = await import('../models/dsa-model');
  const { ResumeModel } = await import('../models/resume-model');

  // Clear current data for this user
  await Promise.all([
    TaskModel.deleteMany({ userId }),
    HabitModel.deleteMany({ userId }),
    StudyModel.deleteMany({ userId }),
    JobModel.deleteMany({ userId }),
    ExpenseModel.deleteMany({ userId }),
    FlashcardModel.deleteMany({ userId }),
    NoteModel.deleteMany({ userId }),
    JournalModel.deleteMany({ userId }),
    ProjectModel.deleteMany({ userId }),
    DsaModel.deleteMany({ userId }),
    ResumeModel.deleteMany({ userId }),
  ]);

  // Strip existing _id & id to allow fresh Mongo IDs
  const prepareDocs = (list: any[]) =>
    (list || []).map(({ _id, id, ...rest }) => ({ ...rest, userId }));

  const tasksToInsert = prepareDocs(dataPayload.tasks);
  const habitsToInsert = prepareDocs(dataPayload.habits);
  const studyToInsert = prepareDocs(dataPayload.studySessions);
  const jobsToInsert = prepareDocs(dataPayload.jobApplications);
  const expensesToInsert = prepareDocs(dataPayload.expenses);
  const flashcardsToInsert = prepareDocs(dataPayload.flashcards);
  const notesToInsert = prepareDocs(dataPayload.notes);
  const journalToInsert = prepareDocs(dataPayload.journalEntries);
  const projectsToInsert = prepareDocs(dataPayload.projects);
  const dsaToInsert = prepareDocs(dataPayload.dsaPatterns);
  const resumesToInsert = prepareDocs(dataPayload.resumeVersions);

  const [
    insertedTasks,
    insertedHabits,
    insertedStudy,
    insertedJobs,
    insertedExpenses,
    insertedFlashcards,
    insertedNotes,
    insertedJournal,
    insertedProjects,
    insertedDsa,
    insertedResumes,
  ] = await Promise.all([
    tasksToInsert.length ? TaskModel.insertMany(tasksToInsert) : [],
    habitsToInsert.length ? HabitModel.insertMany(habitsToInsert) : [],
    studyToInsert.length ? StudyModel.insertMany(studyToInsert) : [],
    jobsToInsert.length ? JobModel.insertMany(jobsToInsert) : [],
    expensesToInsert.length ? ExpenseModel.insertMany(expensesToInsert) : [],
    flashcardsToInsert.length ? FlashcardModel.insertMany(flashcardsToInsert) : [],
    notesToInsert.length ? NoteModel.insertMany(notesToInsert) : [],
    journalToInsert.length ? JournalModel.insertMany(journalToInsert) : [],
    projectsToInsert.length ? ProjectModel.insertMany(projectsToInsert) : [],
    dsaToInsert.length ? DsaModel.insertMany(dsaToInsert) : [],
    resumesToInsert.length ? ResumeModel.insertMany(resumesToInsert) : [],
  ]);

  return {
    importedCount: {
      tasks: insertedTasks.length,
      habits: insertedHabits.length,
      studySessions: insertedStudy.length,
      jobApplications: insertedJobs.length,
      expenses: insertedExpenses.length,
      flashcards: insertedFlashcards.length,
      notes: insertedNotes.length,
      journalEntries: insertedJournal.length,
      projects: insertedProjects.length,
      dsaPatterns: insertedDsa.length,
      resumeVersions: insertedResumes.length,
    },
  };
};

export const resetUserDataService = async (userId: string) => {
  const { TaskModel } = await import('../models/task-model');
  const { HabitModel } = await import('../models/habit-model');
  const { StudyModel } = await import('../models/study-model');
  const { JobModel } = await import('../models/job-model');
  const { ExpenseModel } = await import('../models/expense-model');
  const { FlashcardModel } = await import('../models/flashcard-model');
  const { NoteModel } = await import('../models/note-model');
  const { JournalModel } = await import('../models/journal-model');
  const { ProjectModel } = await import('../models/project-model');
  const { DsaModel } = await import('../models/dsa-model');
  const { ResumeModel } = await import('../models/resume-model');

  await Promise.all([
    TaskModel.deleteMany({ userId }),
    HabitModel.deleteMany({ userId }),
    StudyModel.deleteMany({ userId }),
    JobModel.deleteMany({ userId }),
    ExpenseModel.deleteMany({ userId }),
    FlashcardModel.deleteMany({ userId }),
    NoteModel.deleteMany({ userId }),
    JournalModel.deleteMany({ userId }),
    ProjectModel.deleteMany({ userId }),
    DsaModel.deleteMany({ userId }),
    ResumeModel.deleteMany({ userId }),
  ]);

  return { message: 'All user data reset successfully.' };
};

