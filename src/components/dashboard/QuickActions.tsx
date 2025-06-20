
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
      id: 'focus-session',
      label: 'Start Focus Session',
      icon: Target,
      onClick: () => navigate('/focus'),
      color: 'bg-red-500',
      featured: false,
    },
    {
      id: 'schedule-study',
      label: 'Schedule Study',
      icon: Calendar,
      onClick: () => navigate('/focus'),
      color: 'bg-blue-500',
      featured: false,
    },
    {
      id: 'create-room',
      label: 'Study Room',
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

  return (
    <>
      <Card className="p-4 border-gray-200 animate-fade-in">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        <div className="space-y-3">
          {/* Featured Action - Video Call */}
          <Button
            onClick={() => setShowComingSoon(true)}
            className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 animate-scale-in"
          >
            <Video className="w-5 h-5 mr-2" />
            Start Video Call (Coming Soon)
          </Button>
          
          {/* Regular Actions - Smaller Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  onClick={action.onClick}
                  variant="outline"
                  className="h-14 flex-col space-y-1 border-gray-200 hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 active:scale-95"
                >
                  <Icon className="w-4 h-4 text-gray-600" />
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
