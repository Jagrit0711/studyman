
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Target, Calendar, BookOpen, Users, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'video-call',
      label: 'Start Video Call',
      icon: Video,
      onClick: () => {}, // This would open video call modal
      color: 'bg-gray-900',
      featured: true,
    },
    {
      id: 'schedule-study',
      label: 'Schedule Study Session',
      icon: Calendar,
      onClick: () => navigate('/focus'),
      color: 'bg-blue-500',
      featured: false,
    },
    {
      id: 'focus-session',
      label: 'Start Focus Session',
      icon: Target,
      onClick: () => navigate('/focus'),
      color: 'bg-red-500',
      featured: false,
    },
    {
      id: 'create-room',
      label: 'Create Study Room',
      icon: Users,
      onClick: () => navigate('/create-room'),
      color: 'bg-purple-500',
      featured: false,
    },
    {
      id: 'add-todo',
      label: 'Add Task',
      icon: Plus,
      onClick: () => {}, // This would open a todo modal
      color: 'bg-green-500',
      featured: false,
    },
  ];

  const featuredAction = actions.find(action => action.featured);
  const regularActions = actions.filter(action => !action.featured);

  return (
    <Card className="p-6 border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      
      <div className="space-y-4">
        {/* Featured Action */}
        {featuredAction && (
          <Button
            onClick={featuredAction.onClick}
            className={`w-full h-16 ${featuredAction.color} hover:opacity-90 text-white text-lg font-semibold`}
          >
            <featuredAction.icon className="w-6 h-6 mr-3" />
            {featuredAction.label}
          </Button>
        )}
        
        {/* Regular Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {regularActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={action.onClick}
                variant="outline"
                className="h-20 flex-col space-y-2 border-gray-200 hover:bg-gray-50"
              >
                <Icon className="w-6 h-6 text-gray-600" />
                <span className="text-xs text-center text-gray-700">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default QuickActions;
