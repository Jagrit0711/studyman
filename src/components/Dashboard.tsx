
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StudyRoomCard from './StudyRoomCard';
import FeedPost from './FeedPost';
import { Plus, Filter, TrendingUp, Users, Video, BookOpen } from 'lucide-react';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('rooms');

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

  const feedPosts = [
    {
      id: '1',
      title: 'Best strategies for memorizing complex formulas?',
      content: 'I\'m struggling with remembering all the physics formulas for my upcoming exam. Does anyone have effective techniques that worked for them? I\'ve tried flashcards but they don\'t seem to stick...',
      author: 'Emily Watson',
      timestamp: '2 hours ago',
      likes: 24,
      comments: 8,
      subject: 'Physics',
      isLiked: false
    },
    {
      id: '2',
      title: 'Study group for organic chemistry next week',
      content: 'Planning to organize a study session for organic chemistry reaction mechanisms. We\'ll be covering SN1, SN2, E1, and E2 reactions. Drop a comment if you\'re interested!',
      author: 'Michael Park',
      timestamp: '4 hours ago',
      likes: 15,
      comments: 12,
      subject: 'Chemistry',
      isLiked: true
    },
    {
      id: '3',
      title: 'Anyone else finding linear algebra challenging?',
      content: 'The concept of eigenvalues and eigenvectors is really confusing me. I understand the mathematical operations but struggle with the intuitive understanding. Any recommendations for visual resources?',
      author: 'David Rodriguez',
      timestamp: '6 hours ago',
      likes: 31,
      comments: 18,
      subject: 'Mathematics',
      isLiked: false
    }
  ];

  const stats = [
    { label: 'Active Rooms', value: '24', icon: Video, color: 'text-blue-600' },
    { label: 'Online Users', value: '156', icon: Users, color: 'text-green-600' },
    { label: 'Study Sessions', value: '89', icon: BookOpen, color: 'text-purple-600' },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="notion-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-notion-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-notion-gray-900">{stat.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
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
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" className="bg-notion-gray-900 hover:bg-notion-gray-800">
            <Plus className="w-4 h-4 mr-2" />
            {activeView === 'rooms' ? 'Create Room' : 'New Post'}
          </Button>
        </div>
      </div>

      {/* Content */}
      {activeView === 'rooms' ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-notion-gray-900">Active Study Rooms</h2>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-notion-gray-900">Study Feed</h2>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Latest discussions
            </Badge>
          </div>
          <div className="max-w-2xl mx-auto">
            {feedPosts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
