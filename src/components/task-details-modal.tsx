import { Task } from '@/types/task'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface TaskDetailsModalProps {
  task: Task | null
  open: boolean
  onClose: () => void
}

export function TaskDetailsModal({ task, open, onClose }: TaskDetailsModalProps) {
  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <h3 className="font-semibold">Description</h3>
            <p>{task.description}</p>
          </div>
          <div>
            <h3 className="font-semibold">Status</h3>
            <p>{task.status}</p>
          </div>
          <div>
            <h3 className="font-semibold">Created At</h3>
            <p>{new Date(task.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

