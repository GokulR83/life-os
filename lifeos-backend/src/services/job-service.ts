import { JobModel } from '../models/job-model';
import { IJobApplication } from '../types/job-types';
import { NotFoundError, BadRequestError } from '../utils/app-error-util';

export const getAllJobsService = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '100', 10);
  const skip = (page - 1) * limit;

  const filter: any = { userId };
  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { company: { $regex: query.search, $options: 'i' } },
      { position: { $regex: query.search, $options: 'i' } },
      { role: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [jobs, total] = await Promise.all([
    JobModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    JobModel.countDocuments(filter),
  ]);

  const sanitizedJobs = jobs.map((j) => {
    const obj = j.toObject();
    const lastUpdateDate = new Date(obj.lastUpdated || obj.dateApplied || obj.appliedDate || obj.createdAt || Date.now());
    const isStale = (Date.now() - lastUpdateDate.getTime() > 7 * 86400000) && !['Offer', 'Rejected'].includes(obj.status);
    return {
      ...obj,
      _id: j._id.toString(),
      id: j._id.toString(),
      stale: obj.stale || isStale,
      logo: obj.logo || obj.company.slice(0, 2).toUpperCase(),
    };
  });

  return { jobs: sanitizedJobs, page, limit, total };
};

export const createJobService = async (userId: string, payload: Partial<IJobApplication>): Promise<IJobApplication> => {
  if (!payload.company || !payload.company.trim()) {
    throw new BadRequestError('Company name is required.');
  }

  const pos = (payload.position || payload.role || '').trim() || 'Software Engineer';
  const todayStr = new Date().toISOString().split('T')[0];
  const companyTrimmed = payload.company.trim();

  const newJob = await JobModel.create({
    ...payload,
    company: companyTrimmed,
    position: pos,
    role: pos,
    status: payload.status || 'Applied',
    dateApplied: payload.dateApplied || payload.appliedDate || todayStr,
    appliedDate: payload.dateApplied || payload.appliedDate || todayStr,
    lastUpdated: todayStr,
    salary: payload.salary || payload.salaryRange || '$140k - $170k',
    salaryRange: payload.salaryRange || payload.salary || '$140k - $170k',
    location: payload.location || 'Remote',
    logo: payload.logo || companyTrimmed.slice(0, 2).toUpperCase(),
    stale: false,
    userId,
  });

  const obj = newJob.toObject();
  return { ...obj, _id: newJob._id.toString(), id: newJob._id.toString() };
};

export const getJobByIdService = async (userId: string, id: string): Promise<IJobApplication> => {
  const job = await JobModel.findOne({ _id: id, userId });
  if (!job) {
    throw new NotFoundError(`Job application not found with ID: ${id}`);
  }

  const obj = job.toObject();
  return { ...obj, _id: job._id.toString(), id: job._id.toString() };
};

export const updateJobService = async (userId: string, id: string, payload: Partial<IJobApplication>): Promise<IJobApplication> => {
  if (payload.company !== undefined && !payload.company.trim()) {
    throw new BadRequestError('Company name cannot be empty.');
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const updateData: any = { ...payload, lastUpdated: todayStr };

  if (payload.company) {
    updateData.company = payload.company.trim();
  }
  if (payload.position || payload.role) {
    const roleVal = (payload.position || payload.role || '').trim();
    updateData.position = roleVal;
    updateData.role = roleVal;
  }
  if (payload.status) {
    // Changing status clears stale flag
    updateData.stale = false;
  }

  const job = await JobModel.findOneAndUpdate(
    { _id: id, userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!job) {
    throw new NotFoundError(`Job application not found with ID: ${id}`);
  }

  const obj = job.toObject();
  return { ...obj, _id: job._id.toString(), id: job._id.toString() };
};

export const followUpJobService = async (userId: string, id: string): Promise<IJobApplication> => {
  const todayStr = new Date().toISOString().split('T')[0];

  const job = await JobModel.findOneAndUpdate(
    { _id: id, userId },
    { lastUpdated: todayStr, stale: false },
    { new: true }
  );

  if (!job) {
    throw new NotFoundError(`Job application not found with ID: ${id}`);
  }

  const obj = job.toObject();
  return { ...obj, _id: job._id.toString(), id: job._id.toString() };
};

export const deleteJobService = async (userId: string, id: string): Promise<void> => {
  const job = await JobModel.findOneAndDelete({ _id: id, userId });
  if (!job) {
    throw new NotFoundError(`Job application not found with ID: ${id}`);
  }
};

