
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Target, Calendar, BookOpen, Users, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ComingSoonModal } from '@/components/ui/coming-soon-modal';
import { useState } from 'react';

const QuickActions = () => {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);

  const actions = [
    {
      id: 'video-call',
      label: 'Start Video Call (Coming Soon)',
      icon: Video,
      onClick: () => setShowComingSoon(true),
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
    <>
      <Card className="p-4 border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="space-y-3">
          {/* Featured Action */}
          {featuredAction && (
            <Button
              onClick={featuredAction.onClick}
              className={`w-full h-12 ${featuredAction.color} hover:opacity-90 text-white text-sm font-medium`}
            >
              <featuredAction.icon className="w-5 h-5 mr-2" />
              {featuredAction.label}
            </Button>
          )}
          
          {/* Regular Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {regularActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  onClick={action.onClick}
                  variant="outline"
                  className="h-16 flex-col space-y-1 border-gray-200 hover:bg-gray-50"
                >
                  <Icon className="w-5 h-5 text-gray-600" />
                  <span className="text-xs text-center text-gray-700">{action.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        feature="Video Call"
      />
    </>
  );
};

export default QuickActions;
