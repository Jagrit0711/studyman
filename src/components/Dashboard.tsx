
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar, Bell, TrendingUp, Heart, MessageCircle, BookOpen, Target } from 'lucide-react';
import UpcomingSection from './dashboard/UpcomingSection';
import CalendarSection from './dashboard/CalendarSection';
import { useUserStats } from '@/hooks/useUserStats';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { useRecentActivities } from '@/hooks/useRecentActivities';

const Dashboard = () => {
  const { stats, loading: statsLoading } = useUserStats();
  const { posts } = usePosts();
  const { user } = useAuth();
  const { activities, loading: activitiesLoading } = useRecentActivities();

  // Mock data for notifications (will be replaced with real data later)
  const notifications = [
    { type: 'like', message: 'Sarah liked your post about calculus', time: '1h ago' },
    { type: 'comment', message: 'Alex commented on your study tips', time: '3h ago' },
    { type: 'share', message: 'Maya shared your physics notes', time: '5h ago' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'focus_session': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'task_completed': return <Target className="w-4 h-4 text-green-600" />;
      case 'exam_attended': return <Target className="w-4 h-4 text-red-600" />;
      case 'assignment_submitted': return <Calendar className="w-4 h-4 text-purple-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment': return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'share': return <TrendingUp className="w-4 h-4 text-green-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Dynamic Stats Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Study Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Study Hours */}
          <Card className="p-6 border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Study Hours Today</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statsLoading ? '...' : `${Math.floor((stats?.study_hours || 0) / 60)}h`}
                </p>
                <p className="text-xs text-green-600 mt-1">+2.5h from yesterday</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Study Sessions */}
          <Card className="p-6 border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sessions This Week</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statsLoading ? '...' : stats?.sessions_led || 0}
                </p>
                <p className="text-xs text-purple-600 mt-1">+{stats?.sessions_led || 0} completed</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Upcoming Exams */}
          <Card className="p-6 border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Upcoming Exams</p>
                <p className="text-3xl font-bold text-gray-900">2</p>
                <p className="text-xs text-orange-600 mt-1">Next: Tomorrow</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          {/* Post Interactions */}
          <Card className="p-6 border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Post Interactions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {posts?.reduce((acc, post) => acc + (post.likes_count || 0) + (post.comments_count || 0), 0) || 0}
                </p>
                <p className="text-xs text-green-600 mt-1">+12 this week</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Activity */}
        <div className="lg:col-span-1">
          <Card className="p-6 border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Badge variant="outline" className="border-gray-300 text-gray-600">
                Last 24h
              </Badge>
            </div>
            <div className="space-y-4">
              {activitiesLoading ? (
                <div className="text-sm text-gray-500">Loading activities...</div>
              ) : activities.length === 0 ? (
                <div className="text-sm text-gray-500">No recent activities</div>
              ) : (
                activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    {getActivityIcon(activity.activity_type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.description} • {formatTimeAgo(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6 border-gray-200 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <Badge variant="outline" className="border-gray-300 text-gray-600">
                3 new
              </Badge>
            </div>
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - Upcoming and Calendar */}
        <div className="lg:col-span-2 space-y-6">
          <UpcomingSection />
          <CalendarSection />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
