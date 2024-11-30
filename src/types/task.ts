export type TaskStatus = 'TODO' | 'IN PROGRESS' | 'DONE'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
  user: string
}

