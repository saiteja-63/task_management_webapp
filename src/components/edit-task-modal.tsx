import { useState, useEffect } from 'react'
import { Task, TaskStatus } from '@/types/task'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EditTaskModalProps {
  task: Task | null
  open: boolean
  onClose: () => void
  onSave: (task: Task) => void
}

export function EditTaskModal({ task, open, onClose, onSave }: EditTaskModalProps) {
  const [editedTask, setEditedTask] = useState<Task | null>(null)

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task })
    } else if (open) {
      // Initialize empty task when opening new task modal
      setEditedTask({
        id: '',
        title: '',
        description: '',
        status: 'TODO' as TaskStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: ''
      })
    }
  }, [task, open])

  const handleSave = () => {
    if (editedTask) {
      onSave(editedTask)
      onClose()
    }
  }

  if (!editedTask) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="title" className="text-right">
              Title
            </label>
            <Input
              id="title"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="description" className="text-right">
              Description
            </label>
            <Textarea
              id="description"
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="status" className="text-right">
              Status
            </label>
            <Select
              value={editedTask.status}
              onValueChange={(value: TaskStatus) => setEditedTask({ ...editedTask, status: value })}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

