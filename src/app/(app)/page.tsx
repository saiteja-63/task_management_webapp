import { TaskBoard } from '@/components/task-board'

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Task Management</h1>
      <TaskBoard />
    </main>
  )
}

