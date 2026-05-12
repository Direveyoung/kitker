export type Priority = 1 | 2 | 3 | 4;
export type Recurrence = "daily" | "weekly" | "monthly" | null;

export type TaskItem = {
  id: string;
  title: string | null;
  body: string;
  tags: string[];
  completed: boolean;
  completedAt: Date | null;
  dueAt: Date | null;
  priority: number;
  recurrence: Recurrence;
  carryOverCount: number;
  createdAt: Date;
  updatedAt: Date;
};
