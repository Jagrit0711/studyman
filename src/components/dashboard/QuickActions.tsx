
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Target, Calendar, BookOpen, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'focus-session',
      label: 'Start Focus Session',
      icon: Target,
      onClick: () => navigate('/focus'),
      color: 'bg-red-500',
    },
    {
      id: 'create-room',
      label: 'Create Study Room',
      icon: Users,
      onClick: () => navigate('/create-room'),
      color: 'bg-blue-500',
    },
    {
      id: 'schedule-study',
      label: 'Schedule Study Time',
      icon: Calendar,
      onClick: () => navigate('/focus'),
      color: 'bg-green-500',
    },
    {
      id: 'add-todo',
      label: 'Add Task',
      icon: Plus,
      onClick: () => {}, // This would open a todo modal
      color: 'bg-purple-500',
    },
  ];

  return (
    <Card className="p-6 border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              onClick={action.onClick}
              variant="outline"
              className={`h-16 flex-col space-y-1 border-gray-200 hover:${action.color.replace('bg-', 'bg-').replace('-500', '-50')} hover:border-${action.color.replace('bg-', '').replace('-500', '-200')}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs text-center">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default QuickActions;
