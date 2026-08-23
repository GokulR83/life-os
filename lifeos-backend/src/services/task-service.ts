import { TaskModel } from '../models/task-model';
import { ITask } from '../types/task-types';
import { NotFoundError, BadRequestError } from '../utils/app-error-util';

export const getAllTasksService = async (userId: string, query: any) => {
  const page = parseInt(query.page || '1', 10);
  const limit = parseInt(query.limit || '100', 10);
  const skip = (page - 1) * limit;
  const todayStr = new Date().toISOString().split('T')[0];

  const filter: any = { userId };
  const andConditions: any[] = [];

  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;

  if (query.search) {
    andConditions.push({
      $or: [
        { title: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { category: { $regex: query.search, $options: 'i' } }
      ]
    });
  }

  if (query.isOverdue === 'true') {
    filter.completed = false;
    andConditions.push({
      $or: [
        { dueDate: { $lt: todayStr } },
        { deadline: { $lt: todayStr } }
      ]
    });
  }

  if (andConditions.length > 0) {
    filter.$and = andConditions;
  }

  const [rawTasks, total] = await Promise.all([
    TaskModel.find(filter).sort({ dueDate: 1, deadline: 1, createdAt: -1 }).skip(skip).limit(limit),
    TaskModel.countDocuments(filter),
  ]);

  const priorityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

  const sortedTasks = [...rawTasks].sort((a, b) => {
    const dateARaw = a.dueDate || a.deadline;
    const dateBRaw = b.dueDate || b.deadline;

    const dateA = dateARaw ? new Date(dateARaw).getTime() : Infinity;
    const dateB = dateBRaw ? new Date(dateBRaw).getTime() : Infinity;

    // 1. Primary Sort: Completion / Due Date (Earliest / Nearest Deadline First)
    if (dateA !== dateB) {
      return dateA - dateB;
    }

    // 2. Secondary Sort: Priority (High > Medium > Low)
    const weightA = priorityWeight[a.priority || 'Low'] || 0;
    const weightB = priorityWeight[b.priority || 'Low'] || 0;
    return weightB - weightA;
  });

  const sanitizedTasks = sortedTasks.map((t) => {
    const obj = t.toObject ? t.toObject() : t;
    const taskDateStr = (obj.dueDate || obj.deadline || '').split('T')[0];
    const isOverdue = taskDateStr ? taskDateStr < todayStr && !obj.completed : false;

    return {
      ...obj,
      _id: t._id.toString(),
      id: t._id.toString(),
      isOverdue
    };
  });

  return { tasks: sanitizedTasks, page, limit, total };
};

export const moveOverdueToTodayService = async (userId: string) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const result = await TaskModel.updateMany(
    {
      userId,
      completed: false,
      $or: [
        { dueDate: { $lt: todayStr } },
        { deadline: { $lt: todayStr } }
      ]
    },
    { $set: { dueDate: todayStr, deadline: todayStr } }
  );

  return { message: 'Overdue tasks moved to today successfully', modifiedCount: result.modifiedCount };
};

export const createTaskService = async (userId: string, payload: Partial<ITask>): Promise<ITask> => {
  if (!payload.title) {
    throw new BadRequestError('Task title is required.');
  }

  const completed = payload.completed || payload.status === 'Done';
  const newTask = await TaskModel.create({
    ...payload,
    userId,
    completed,
    completedAt: completed ? new Date().toISOString() : undefined,
  });

  const obj = newTask.toObject();
  return { ...obj, _id: newTask._id.toString(), id: newTask._id.toString() };
};

export const getTaskByIdService = async (userId: string, id: string): Promise<ITask> => {
  const task = await TaskModel.findOne({ _id: id, userId });
  if (!task) {
    throw new NotFoundError(`Task not found with ID: ${id}`);
  }

  const obj = task.toObject();
  return { ...obj, _id: task._id.toString(), id: task._id.toString() };
};

export const updateTaskService = async (userId: string, id: string, payload: Partial<ITask>): Promise<ITask> => {
  if (payload.status) {
    payload.completed = payload.status === 'Done';
  } else if (payload.completed !== undefined) {
    payload.status = payload.completed ? 'Done' : 'Todo';
  }

  if (payload.completed) {
    payload.completedAt = new Date().toISOString();
  }

  const task = await TaskModel.findOneAndUpdate({ _id: id, userId }, payload, {
    new: true,
    runValidators: true,
  });

  if (!task) {
    throw new NotFoundError(`Task not found with ID: ${id}`);
  }

  const obj = task.toObject();
  return { ...obj, _id: task._id.toString(), id: task._id.toString() };
};

export const deleteTaskService = async (userId: string, id: string): Promise<void> => {
  const task = await TaskModel.findOneAndDelete({ _id: id, userId });
  if (!task) {
    throw new NotFoundError(`Task not found with ID: ${id}`);
  }
};

export const bulkUpdateTasksService = async (userId: string, taskIds: string[], updatedFields: Partial<ITask>) => {
  if (updatedFields.status) {
    updatedFields.completed = updatedFields.status === 'Done';
  }

  await TaskModel.updateMany(
    { _id: { $in: taskIds }, userId },
    { $set: updatedFields }
  );

  return { message: 'Tasks updated successfully' };
};

export const bulkDeleteTasksService = async (userId: string, taskIds: string[]) => {
  await TaskModel.deleteMany({ _id: { $in: taskIds }, userId });
  return { message: 'Tasks deleted successfully' };
};
