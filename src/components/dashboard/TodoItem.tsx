
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2, Clock } from 'lucide-react';
import { Todo } from './UpcomingSection';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItem = ({ todo, onToggle, onDelete }: TodoItemProps) => {
  const getPriorityColor = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    }
  };

  const formatDeadline = (deadline: Date) => {
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600 dark:text-red-400' };
    } else if (diffDays === 0) {
      return { text: 'Due today', color: 'text-orange-600 dark:text-orange-400' };
    } else if (diffDays === 1) {
      return { text: 'Due tomorrow', color: 'text-yellow-600 dark:text-yellow-400' };
    } else if (diffDays <= 7) {
      return { text: `Due in ${diffDays} days`, color: 'text-blue-600 dark:text-blue-400' };
    } else {
      return { text: deadline.toLocaleDateString(), color: 'text-muted-foreground' };
    }
  };

  const deadlineInfo = todo.deadline ? formatDeadline(todo.deadline) : null;

  return (
    <div className={`flex items-start space-x-3 p-3 rounded-lg border ${
      todo.completed ? 'bg-muted/50' : 'bg-background'
    }`}>
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="mt-1"
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h4 className={`font-medium ${
            todo.completed ? 'line-through text-muted-foreground' : ''
          }`}>
            {todo.title}
          </h4>
          <Badge variant="secondary" className={getPriorityColor(todo.priority)}>
            {todo.priority}
          </Badge>
        </div>
        
        {todo.description && (
          <p className={`text-sm mb-2 ${
            todo.completed ? 'line-through text-muted-foreground' : 'text-muted-foreground'
          }`}>
            {todo.description}
          </p>
        )}
        
        {deadlineInfo && (
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span className={`text-xs ${deadlineInfo.color}`}>
              {deadlineInfo.text}
            </span>
          </div>
        )}
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(todo.id)}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default TodoItem;
