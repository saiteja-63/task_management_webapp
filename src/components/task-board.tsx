/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  useDroppable
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy
} from "@dnd-kit/sortable"
import { Task, TaskStatus } from "@/types/task"
import TaskCard from "./task-card"
import { TaskDetailsModal } from "./task-details-modal"
import { EditTaskModal } from "./edit-task-modal"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { supabase, ensureUserInPayload } from "@/lib/supabaseClient"
import axios from "axios"
import stringify from 'query-string'

const COLUMNS: TaskStatus[] = ["TODO", "IN PROGRESS", "DONE"]

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [viewTask, setViewTask] = useState<Task | null>(null)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"recent" | "oldest">("recent")
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState({
    add: false,
    logout: false
  })
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  useEffect(() => {
    const fetchTasksForUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setUser(user)
        fetchTasks(user.email)
      }
    }
    fetchTasksForUser()
  }, [])

  const fetchTasks = async (email: string) => {
    try {
      const query = {
        where: {
          user_email: {
            equals: email
          }
        }
      }

      const queryString = stringify.stringify(query)
      const response = await axios.get(`/api/task?${queryString}`)
     setTasks(response.data.docs)
    const userTasks = response.data.docs.filter((task: Task) => task.user_email === email)
    setTasks(userTasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const refreshTasks = async () => {
    if (user?.email) {
      await fetchTasks(user.email)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const activeTask = tasks.find((task) => task.id === active.id)
      const overTask = tasks.find((task) => task.id === over.id)

      if (activeTask && overTask) {
        const activeIndex = tasks.findIndex((task) => task.id === active.id)
        const overIndex = tasks.findIndex((task) => task.id === over.id)

        if (activeTask.status !== overTask.status) {
          // Task is being moved to a different column
          const updatedTasks = [...tasks]
          updatedTasks[activeIndex] = { ...activeTask, status: overTask.status }
          setTasks(updatedTasks)

          try {
            await axios.patch(`/api/task/${active.id}`, {
              status: overTask.status,
            })
          } catch (error) {
            console.error('Error updating task status:', error)
            // Revert the change if the API call fails
            setTasks(tasks)
          }
        } else {
          // Task is being reordered within the same column
          setTasks((tasks) => arrayMove(tasks, activeIndex, overIndex))
        }
      }
    }
    setActiveId(null)
  }

  function Droppable(props: { id: string; children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({
      id: props.id,
    })

    return (
      <div ref={setNodeRef} className="min-h-[200px]">
        {props.children}
      </div>
    )
  }

  const handleAddTask = async (newTaskData: Task) => {
    if (!user?.email) return;
    setIsLoading(prev => ({ ...prev, add: true }));
    try {
      const newTask = {
        ...newTaskData,
        user_email: user.email,
        createdAt: new Date().toISOString()
      }
      
      await axios.post(`/api/task`, newTask)
      await refreshTasks()
    } catch (error) {
      console.error('Error adding task:', error)
    } finally {
      setIsLoading(prev => ({ ...prev, add: false }));
    }
  }

  const handleNewTaskSave = (task: Task) => {
    handleAddTask(task)
    setIsNewTaskModalOpen(false)
  }

  const handleDeleteTask = async (id: string) => {
    if (!user?.email) return;
    try {
      await axios.delete(`/api/task/${id}`)
      await refreshTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleSaveTask = async (updatedTask: Task) => {
    if (!user?.email) return;
    try {
      await axios.patch(`/api/task/${updatedTask.id}`, updatedTask)
      await refreshTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    }
  }

  const handleLogout = async () => {
    setIsLoading(prev => ({ ...prev, logout: true }));
    try {
      await supabase.auth.signOut()
      // Redirect to login page or update UI state
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoading(prev => ({ ...prev, logout: false })); 
    }
  }

  const handleEditTask = (task: Task) => {
    setEditTask(task)
  }

  const handleViewTask = (task: Task) => {
    setViewTask(task)
  }

  const handleCloseModals = () => {
    setViewTask(null)
    setEditTask(null)
    setIsNewTaskModalOpen(false)
  }

  const filteredTasks = tasks
    .filter((task) => {
      const searchLower = searchTerm.toLowerCase();
      const title = task.title?.toLowerCase() ?? '';
      const description = task.description?.toLowerCase() ?? '';
      return title.includes(searchLower) || description.includes(searchLower);
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
    })

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={() => setIsNewTaskModalOpen(true)} 
          disabled={isLoading.add}
        >
          {isLoading.add ? 'Adding...' : 'Add Task'}
        </Button>
        <Button variant="destructive" onClick={handleLogout} disabled={isLoading.logout}>
          {isLoading.logout ? 'Logging out...' : 'Logout'}
        </Button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <div className="w-1/2">
          <Input
            type="search"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <span>Sort By:</span>
          <Select value={sortBy} onValueChange={(value: "recent" | "oldest") => setSortBy(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((column) => (
          <div key={column} className="bg-gray-100 p-4 rounded-lg transition-all duration-300">
            <h2 className="text-lg font-bold mb-4">{column}</h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <Droppable id={column}>
                <SortableContext
                  items={filteredTasks
                    .filter((task) => task?.status === column)
                    .map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredTasks
                    .filter((task) => task.status === column)
                    .map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onEdit={handleEditTask}
                        onDelete={handleDeleteTask}
                        onView={handleViewTask}
                      />
                    ))}
                </SortableContext>
              </Droppable>
              <DragOverlay>
                {activeId ? (
                  <TaskCard
                    task={tasks.find((task) => task.id === activeId)!}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                    onView={handleViewTask}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        ))}
      </div>
      <TaskDetailsModal
        task={viewTask}
        open={!!viewTask}
        onClose={handleCloseModals}
      />
      <EditTaskModal
        task={editTask}
        open={!!editTask}
        onClose={handleCloseModals}
        onSave={handleSaveTask}
      />
      <EditTaskModal
        task={null}
        open={isNewTaskModalOpen}
        onClose={handleCloseModals}
        onSave={handleNewTaskSave}
      />
    </div>
  )
}

