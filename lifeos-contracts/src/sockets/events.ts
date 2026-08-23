export type EntityType =
  | 'tasks'
  | 'projects'
  | 'notes'
  | 'jobs'
  | 'expenses'
  | 'journals'
  | 'habits'
  | 'flashcards'
  | 'study'
  | 'resumes';

export type RealtimeAction = 'create' | 'update' | 'delete';

export interface RealtimeEntityChangeEvent<T = any> {
  entityType: EntityType;
  action: RealtimeAction;
  payload?: T;
}
