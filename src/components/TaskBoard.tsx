
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import TaskColumn, { Column } from './TaskColumn';
import { Task } from './TaskCard';

// Initial data for the task board
const initialColumns: Column[] = [
  {
    id: 'prospecting',
    title: 'Prospecting',
    color: 'muted',
    tasks: [
      {
        id: 't1',
        title: 'Multifamily Market Analysis - Atlanta',
        description: 'Analyze cap rates, rent growth, and demographic trends in target submarkets',
        tag: { color: 'blue', label: 'Acquisition' },
        dueDate: 'May 20',
        assignees: 2,
        progress: { completed: 3, total: 5 }
      },
      {
        id: 't2',
        title: 'Industrial Property Deal Flow Review',
        description: 'Evaluate 12 warehouse opportunities in Nashville market',
        tag: { color: 'blue', label: 'Acquisition' },
        dueDate: 'May 22',
        assignees: 1,
        progress: { completed: 0, total: 4 }
      },
      {
        id: 't3',
        title: 'Owner Outreach Campaign - Class B Apartments',
        description: 'Contact 487 identified owners in target price range ($5-15M)',
        tag: { color: 'purple', label: 'Marketing' },
        dueDate: 'May 24',
        assignees: 2,
        progress: { completed: 0, total: 6 }
      },
      {
        id: 't4',
        title: 'Underwriting Model Updates',
        description: 'Update acquisition models for current interest rate environment',
        tag: { color: 'green', label: 'Finance' },
        dueDate: 'May 25',
        assignees: 1,
        progress: { completed: 0, total: 3 }
      }
    ]
  },
  {
    id: 'due-diligence',
    title: 'Due Diligence',
    color: 'blue',
    tasks: [
      {
        id: 't5',
        title: '123 Main St Apartment Complex - Phase I ESA',
        description: 'Environmental site assessment and soil contamination review',
        tag: { color: 'orange', label: 'Due Diligence' },
        dueDate: 'May 18',
        assignees: 1,
        progress: { completed: 2, total: 3 }
      },
      {
        id: 't6',
        title: 'Financial Audit - Riverside Industrial Park',
        description: 'Review 3 years of NOI, rent rolls, and operating expenses',
        tag: { color: 'green', label: 'Finance' },
        dueDate: 'May 19',
        assignees: 2,
        progress: { completed: 5, total: 8 }
      },
      {
        id: 't7',
        title: 'Title & Survey Review - Downtown Office',
        description: 'Examine title insurance, easements, and boundary survey',
        tag: { color: 'red', label: 'Legal' },
        dueDate: 'May 17',
        assignees: 1,
        progress: { completed: 3, total: 4 }
      }
    ]
  },
  {
    id: 'under-contract',
    title: 'Under Contract',
    color: 'amber',
    tasks: [
      {
        id: 't8',
        title: 'Debt Financing - $12M Acquisition Loan',
        description: 'Coordinate with lender on loan docs and closing conditions',
        tag: { color: 'green', label: 'Finance' },
        dueDate: 'May 15',
        assignees: 1,
        progress: { completed: 4, total: 5 }
      },
      {
        id: 't9',
        title: 'Property Management Transition Plan',
        description: 'Coordinate handoff with current PM and tenant communications',
        tag: { color: 'teal', label: 'Asset Management' },
        dueDate: 'May 16',
        assignees: 2,
        progress: { completed: 6, total: 6 }
      },
      {
        id: 't10',
        title: 'Investor Capital Call - Fund II',
        description: 'Prepare capital call notice for $8M equity requirement',
        tag: { color: 'purple', label: 'Investor Relations' },
        dueDate: 'May 14',
        assignees: 1,
        progress: { completed: 12, total: 12 }
      }
    ]
  },
  {
    id: 'closed',
    title: 'Closed',
    color: 'accent',
    tasks: [
      {
        id: 't11',
        title: 'Oak Street Retail Center - Acquisition Complete',
        description: 'Successfully closed $24M retail acquisition with 7.2% IRR projection',
        tag: { color: 'blue', label: 'Acquisition' },
        dueDate: 'May 10',
        assignees: 1,
        progress: { completed: 5, total: 5 }
      },
      {
        id: 't12',
        title: 'Quarterly Investor Reporting - Q1 2024',
        description: 'Distributed performance reports to 47 limited partners',
        tag: { color: 'purple', label: 'Investor Relations' },
        dueDate: 'May 9',
        assignees: 1,
        progress: { completed: 4, total: 4 }
      },
      {
        id: 't13',
        title: 'Portfolio Refinancing - 3 Properties',
        description: 'Completed $45M refinancing across industrial portfolio',
        tag: { color: 'green', label: 'Finance' },
        dueDate: 'May 8',
        assignees: 2,
        progress: { completed: 7, total: 7 }
      }
    ]
  }
];

interface TaskBoardProps {
  className?: string;
}

const TaskBoard: React.FC<TaskBoardProps> = ({ className }) => {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragSourceColumn, setDragSourceColumn] = useState<string | null>(null);
  const { toast } = useToast();

  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData('taskId', task.id);
    setDraggedTask(task);
    
    // Find source column
    const sourceColumn = columns.find(col => 
      col.tasks.some(t => t.id === task.id)
    );
    
    if (sourceColumn) {
      setDragSourceColumn(sourceColumn.id);
      e.dataTransfer.setData('sourceColumnId', sourceColumn.id);
    }
  };

  const handleTaskDragEnd = () => {
    setDraggedTask(null);
    setDragSourceColumn(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Handle drag leave logic if needed
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColumnId = e.dataTransfer.getData('sourceColumnId');
    
    if (!taskId || !sourceColumnId || sourceColumnId === targetColumnId) {
      return;
    }
    
    // Update columns state
    const newColumns = columns.map(column => {
      // Remove task from source column
      if (column.id === sourceColumnId) {
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        };
      }
      
      // Add task to target column
      if (column.id === targetColumnId) {
        const taskToMove = columns.find(col => col.id === sourceColumnId)?.tasks.find(task => task.id === taskId);
        if (taskToMove) {
          return {
            ...column,
            tasks: [...column.tasks, taskToMove]
          };
        }
      }
      
      return column;
    });
    
    setColumns(newColumns);
    
    // Show a toast notification
    const targetColumn = columns.find(col => col.id === targetColumnId);
    if (targetColumn && draggedTask) {
      toast({
        title: "Task moved",
        description: `${draggedTask.title} moved to ${targetColumn.title}`,
      });
    }
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    // This function can be used for programmatic status changes (not used in this implementation)
  };

  return (
    <div className={`flex gap-4 overflow-x-auto pb-4 ${className}`}>
      {columns.map(column => (
        <TaskColumn
          key={column.id}
          column={column}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onTaskDragStart={handleTaskDragStart}
          onTaskDragEnd={handleTaskDragEnd}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
};

export default TaskBoard;
