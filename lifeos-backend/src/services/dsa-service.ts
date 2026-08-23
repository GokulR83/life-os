import mongoose from 'mongoose';
import { DsaModel } from '../models/dsa-model';
import { IDsaProblem } from '../types/dsa-types';
import { NotFoundError, BadRequestError } from '../utils/app-error-util';

export const getAllDsaService = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '100', 10);
  const skip = (page - 1) * limit;

  const filter: any = { userId };
  if (query.pattern) filter.pattern = query.pattern;
  if (query.difficulty) filter.difficulty = query.difficulty;

  const [dsaProblems, total] = await Promise.all([
    DsaModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    DsaModel.countDocuments(filter),
  ]);

  const sanitizedProblems = dsaProblems.map((d) => {
    const obj = d.toObject();
    const name = d.name || d.title || d.pattern || 'DSA Pattern';
    return { ...obj, _id: d._id.toString(), id: d._id.toString(), name, title: name };
  });

  return { dsaProblems: sanitizedProblems, page, limit, total };
};

export const createDsaService = async (userId: string, payload: Partial<IDsaProblem>): Promise<IDsaProblem> => {
  const name = payload.name || payload.title || payload.pattern;
  if (!name) {
    throw new BadRequestError('DSA pattern name/title is required.');
  }

  const newProblem = await DsaModel.create({
    ...payload,
    name,
    title: name,
    pattern: payload.pattern || name,
    userId,
  });

  const obj = newProblem.toObject();
  return { ...obj, _id: newProblem._id.toString(), id: newProblem._id.toString(), name, title: name };
};

export const getDsaByIdService = async (userId: string, id: string): Promise<IDsaProblem> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid ID format: ${id}`);
  }

  const dsa = await DsaModel.findOne({ _id: id, userId });
  if (!dsa) {
    throw new NotFoundError(`DSA record not found with ID: ${id}`);
  }

  const obj = dsa.toObject();
  return { ...obj, _id: dsa._id.toString(), id: dsa._id.toString() };
};

export const updateDsaService = async (userId: string, id: string, payload: Partial<IDsaProblem>): Promise<IDsaProblem> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid ID format: ${id}`);
  }

  if (payload.name && !payload.title) payload.title = payload.name;
  if (payload.title && !payload.name) payload.name = payload.title;

  const dsa = await DsaModel.findOneAndUpdate({ _id: id, userId }, payload, {
    new: true,
    runValidators: true,
  });

  if (!dsa) {
    throw new NotFoundError(`DSA record not found with ID: ${id}`);
  }

  const obj = dsa.toObject();
  return { ...obj, _id: dsa._id.toString(), id: dsa._id.toString() };
};

export const deleteDsaService = async (userId: string, id: string): Promise<void> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new BadRequestError(`Invalid ID format: ${id}`);
  }

  const dsa = await DsaModel.findOneAndDelete({ _id: id, userId });
  if (!dsa) {
    throw new NotFoundError(`DSA record not found with ID: ${id}`);
  }
};
