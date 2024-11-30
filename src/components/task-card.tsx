import React from 'react';

interface Task {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  // ... other task properties
}

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onView: (task: Task) => void
  isLoading?: {
    edit: boolean
    delete: boolean
  }
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onDelete, 
  onView, 
  isLoading = { edit: false, delete: false } 
}) => {
  return (
    <div 
      className="border p-4 rounded shadow-md cursor-pointer transform transition-all duration-300 hover:scale-102 animate-fade-in" 
      onClick={() => onView(task)}
    >
      <div>
        <p>{task.title || 'Untitled Task'}</p>
        <p className="text-sm text-gray-600">{task.description || 'No description'}</p>
      </div>
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          disabled={isLoading.delete}
          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {isLoading.delete ? 'Deleting...' : 'Delete'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          disabled={isLoading.edit}
          className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
        >
          {isLoading.edit ? 'Editing...' : 'Edit'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(task);
          }}
          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          View
        </button>
      </div>
    </div>
  );
};

export default TaskCard;

