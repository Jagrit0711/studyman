
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, TrendingUp, Users, BookOpen, Plus } from 'lucide-react';
import UpcomingSection from './dashboard/UpcomingSection';
import CalendarSection from './dashboard/CalendarSection';
import StudyRoomCard from './StudyRoomCard';
import FeedPost from './FeedPost';
import CreatePost from './CreatePost';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const { posts, isLoading } = usePosts();
  const { user } = useAuth();

  const studyRooms = [
    {
      id: '1',
      name: 'Advanced Calculus Study Group',
      description: 'Working through differential equations and integration problems. All levels welcome!',
      participants: 8,
      maxParticipants: 12,
      isActive: true,
      isPrivate: false,
      duration: '2h 30m',
      subject: 'Mathematics',
      host: 'Sarah Chen'
    },
    {
      id: '2',
      name: 'MCAT Prep Session',
      description: 'Focused review of biochemistry and organic chemistry concepts.',
      participants: 5,
      maxParticipants: 8,
      isActive: true,
      isPrivate: true,
      duration: '1h 45m',
      subject: 'Medicine',
      host: 'Dr. Johnson'
    },
    {
      id: '3',
      name: 'CS Algorithm Practice',
      description: 'LeetCode problem solving and interview preparation.',
      participants: 12,
      maxParticipants: 15,
      isActive: true,
      isPrivate: false,
      duration: '3h 15m',
      subject: 'Computer Science',
      host: 'Alex Kumar'
    }
  ];

  const stats = [
    { label: 'Active Rooms', value: '24', icon: Video, color: 'text-blue-600' },
    { label: 'Online Users', value: '156', icon: Users, color: 'text-green-600' },
    { label: 'Study Sessions', value: '89', icon: BookOpen, color: 'text-purple-600' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button
            variant={activeView === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveView('overview')}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Overview</span>
          </Button>
          <Button
            variant={activeView === 'rooms' ? 'default' : 'outline'}
            onClick={() => setActiveView('rooms')}
            className="flex items-center space-x-2"
          >
            <Video className="w-4 h-4" />
            <span>Study Rooms</span>
          </Button>
          <Button
            variant={activeView === 'feed' ? 'default' : 'outline'}
            onClick={() => setActiveView('feed')}
            className="flex items-center space-x-2"
          >
            <TrendingUp className="w-4 h-4" />
            <span>Study Feed</span>
          </Button>
        </div>
        
        <Button size="sm" className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          {activeView === 'rooms' ? 'Create Room' : activeView === 'feed' ? 'New Post' : 'Quick Action'}
        </Button>
      </div>

      {/* Content */}
      {activeView === 'overview' ? (
        <div>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Upcoming Section */}
            <div className="space-y-6">
              <UpcomingSection />
            </div>

            {/* Right Column - Calendar Section */}
            <div className="space-y-6">
              <CalendarSection />
            </div>
          </div>
        </div>
      ) : activeView === 'rooms' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Active Study Rooms</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
              {studyRooms.length} rooms active
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyRooms.map((room) => (
              <StudyRoomCard key={room.id} room={room} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Study Feed</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
              Latest discussions
            </Badge>
          </div>
          
          <div className="max-w-2xl mx-auto">
            {user && <CreatePost />}
            
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : posts && posts.length > 0 ? (
              posts.map((post) => (
                <FeedPost key={post.id} post={post} />
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No posts yet. Be the first to share something!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
