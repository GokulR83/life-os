import { ResumeModel } from '../models/resume-model';
import { IResumeVersion } from '../types/resume-types';
import { NotFoundError, BadRequestError } from '../utils/app-error-util';

export const getAllResumesService = async (userId: string) => {
  const resumes = await ResumeModel.find({ userId }).sort({ createdAt: -1 });
  const sanitizedResumes = resumes.map((r) => {
    const obj = r.toObject();
    return { ...obj, _id: r._id.toString(), id: r._id.toString() };
  });
  return sanitizedResumes;
};

export const createResumeService = async (userId: string, payload: Partial<IResumeVersion>): Promise<IResumeVersion> => {
  if (!payload.filename || !payload.filename.trim()) {
    throw new BadRequestError('Resume filename is required.');
  }
  if (!payload.targetRole || !payload.targetRole.trim()) {
    throw new BadRequestError('Target role is required.');
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const newResume = await ResumeModel.create({
    filename: payload.filename.trim(),
    targetRole: payload.targetRole.trim(),
    uploadDate: payload.uploadDate || todayStr,
    notes: payload.notes || '',
    fileUrl: payload.fileUrl || '',
    usedInAppIds: payload.usedInAppIds || [],
    userId,
  });

  const obj = newResume.toObject();
  return { ...obj, _id: newResume._id.toString(), id: newResume._id.toString() };
};

export const getResumeByIdService = async (userId: string, id: string): Promise<IResumeVersion> => {
  const resume = await ResumeModel.findOne({ _id: id, userId });
  if (!resume) {
    throw new NotFoundError(`Resume version not found with ID: ${id}`);
  }
  const obj = resume.toObject();
  return { ...obj, _id: resume._id.toString(), id: resume._id.toString() };
};

export const updateResumeService = async (userId: string, id: string, payload: Partial<IResumeVersion>): Promise<IResumeVersion> => {
  if (payload.filename !== undefined && !payload.filename.trim()) {
    throw new BadRequestError('Filename cannot be empty.');
  }
  if (payload.targetRole !== undefined && !payload.targetRole.trim()) {
    throw new BadRequestError('Target role cannot be empty.');
  }

  const resume = await ResumeModel.findOneAndUpdate(
    { _id: id, userId },
    payload,
    { new: true, runValidators: true }
  );

  if (!resume) {
    throw new NotFoundError(`Resume version not found with ID: ${id}`);
  }

  const obj = resume.toObject();
  return { ...obj, _id: resume._id.toString(), id: resume._id.toString() };
};

export const deleteResumeService = async (userId: string, id: string): Promise<void> => {
  const resume = await ResumeModel.findOneAndDelete({ _id: id, userId });
  if (!resume) {
    throw new NotFoundError(`Resume version not found with ID: ${id}`);
  }
};
