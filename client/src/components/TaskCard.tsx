import React from 'react';
import Avatar from './Avatar';

interface Props {
  task: { id: string; title: string; description?: string; status: string; assignedTo: string };
  assignedName?: string;
  assignedEmail?: string;
  onDelete?: (id: string) => void;
}

const TaskCard: React.FC<Props> = ({ task, assignedName, assignedEmail, onDelete }) => {
  return (
    <div className="p-4 bg-white border rounded shadow">
      <h3 className="text-lg font-bold">{task.title}</h3>
      <p className="text-gray-600 mt-2">{task.description}</p>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center">
          {/* @ts-ignore */}
          <Avatar id={task.assignedTo} name={assignedName} email={assignedEmail} size={8} />
          <div className="ml-3 text-sm">
            <div className="font-medium text-gray-900">{assignedName || task.assignedTo}</div>
            <div className="text-xs text-gray-500">{assignedEmail || ''}</div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 text-xs rounded ${
            task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
            task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'
          }`}>
            {task.status}
          </span>
          <button onClick={() => onDelete && onDelete(task.id)} className="text-sm text-red-500 hover:text-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;