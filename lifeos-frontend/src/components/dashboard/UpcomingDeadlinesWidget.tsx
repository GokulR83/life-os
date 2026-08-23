import React from 'react';
import { useData } from '../../context/DataContext';
import { Calendar, Briefcase, CheckSquare } from 'lucide-react';
import { Badge } from '../common/Badge';
import { EmptyState } from '../common/EmptyState';

export const UpcomingDeadlinesWidget = () => {
  const { tasks = [], jobApplications = [] } = useData();

  const taskList = tasks || [];
  const jobList = jobApplications || [];

  const taskItems = taskList
    .filter((t: any) => !t.completed)
    .map((t: any) => ({
      id: t.id || t._id,
      title: t.title,
      type: 'Task',
      category: t.category || 'General',
      date: t.deadline || t.dueDate || new Date().toISOString(),
      icon: CheckSquare
    }));

  const jobItems = jobList
    .filter((j: any) => ['OA', 'Interview', 'Interviewing'].includes(j.status))
    .map((j: any) => ({
      id: j.id || j._id,
      title: `${j.company || 'Job'} - ${j.role || 'Role'} (${j.status})`,
      type: 'Job',
      category: j.status,
      date: j.lastUpdated || new Date().toISOString(),
      icon: Briefcase
    }));

  const combined = [...taskItems, ...jobItems]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-5 rounded-2xl border border-theme-border bg-theme-card shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-theme-accent" />
            <h2 className="text-base font-bold text-theme-main">Upcoming Deadlines</h2>
          </div>
          <span className="text-xs font-semibold text-theme-muted">Next 5 items</span>
        </div>

        {combined.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No upcoming deadlines"
            description="All caught up! No task deadlines or job interview milestones currently scheduled."
            className="py-6"
          />
        ) : (
          <div className="space-y-3">
            {combined.map((item) => {
              const Icon = item.icon;
              const dateObj = new Date(item.date);
              const dateStr = isNaN(dateObj.getTime())
                ? item.date
                : dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-theme-border bg-theme-surface hover:border-theme-accent transition"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="p-2 rounded-lg bg-theme-accent-light text-theme-accent">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-theme-main truncate">{item.title}</p>
                      <span className="text-[10px] text-theme-muted font-medium">
                        {item.type} • {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                    <Badge variant="orange" size="sm">{dateStr}</Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
