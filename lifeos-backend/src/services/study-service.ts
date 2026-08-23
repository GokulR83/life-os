import { StudyModel } from '../models/study-model';
import { IStudySession } from '../types/study-types';
import { NotFoundError, BadRequestError } from '../utils/app-error-util';

export const getAllStudySessionsService = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '100', 10);
  const skip = (page - 1) * limit;

  const filter: any = { userId };
  if (query.subject) filter.subject = { $regex: query.subject, $options: 'i' };

  const [sessions, total] = await Promise.all([
    StudyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    StudyModel.countDocuments(filter),
  ]);

  const sanitizedSessions = sessions.map((s) => {
    const obj = s.toObject();
    const durMins = obj.durationMinutes || obj.duration || 25;
    const durHrs = obj.durationHours || parseFloat((durMins / 60).toFixed(2));
    return {
      ...obj,
      _id: s._id.toString(),
      id: s._id.toString(),
      durationMinutes: durMins,
      duration: durMins,
      durationHours: durHrs,
    };
  });

  return { sessions: sanitizedSessions, page, limit, total };
};

export const createStudySessionService = async (userId: string, payload: Partial<IStudySession>): Promise<IStudySession> => {
  if (!payload.subject) {
    throw new BadRequestError('Subject is required.');
  }

  let durationHours = payload.durationHours;
  let durationMinutes = payload.durationMinutes || payload.duration;

  if (durationHours && !durationMinutes) {
    durationMinutes = Math.round(durationHours * 60);
  } else if (durationMinutes && !durationHours) {
    durationHours = parseFloat((durationMinutes / 60).toFixed(2));
  } else if (!durationHours && !durationMinutes) {
    durationMinutes = 25;
    durationHours = 0.42;
  }

  const newSession = await StudyModel.create({
    ...payload,
    duration: durationMinutes,
    durationMinutes,
    durationHours,
    date: payload.date || new Date().toISOString().split('T')[0],
    timestamp: payload.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    userId,
  });

  const obj = newSession.toObject();
  return { ...obj, _id: newSession._id.toString(), id: newSession._id.toString() };
};

export const getStudySessionByIdService = async (userId: string, id: string): Promise<IStudySession> => {
  const session = await StudyModel.findOne({ _id: id, userId });
  if (!session) {
    throw new NotFoundError(`Study session not found with ID: ${id}`);
  }

  const obj = session.toObject();
  return { ...obj, _id: session._id.toString(), id: session._id.toString() };
};

export const updateStudySessionService = async (userId: string, id: string, payload: Partial<IStudySession>): Promise<IStudySession> => {
  const session = await StudyModel.findOneAndUpdate({ _id: id, userId }, payload, {
    new: true,
    runValidators: true,
  });

  if (!session) {
    throw new NotFoundError(`Study session not found with ID: ${id}`);
  }

  const obj = session.toObject();
  return { ...obj, _id: session._id.toString(), id: session._id.toString() };
};

export const deleteStudySessionService = async (userId: string, id: string): Promise<void> => {
  const session = await StudyModel.findOneAndDelete({ _id: id, userId });
  if (!session) {
    throw new NotFoundError(`Study session not found with ID: ${id}`);
  }
};
