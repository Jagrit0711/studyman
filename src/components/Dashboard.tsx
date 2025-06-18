
import { Card } from '@/components/ui/card';
import { Clock, Target, TrendingUp, BookOpen, Calendar } from 'lucide-react';
import UpcomingSection from './dashboard/UpcomingSection';
import CalendarSection from './dashboard/CalendarSection';
import QuickActions from './dashboard/QuickActions';
import { useUserStats } from '@/hooks/useUserStats';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';
import { useRecentActivities } from '@/hooks/useRecentActivities';
import { useFocusSessions } from '@/hooks/useFocusSessions';

const Dashboard = () => {
  const { stats, loading: statsLoading } = useUserStats();
  const { posts } = usePosts();
  const { user } = useAuth();
  const { activities, loading: activitiesLoading } = useRecentActivities();
  const { sessions } = useFocusSessions();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'focus_session': return <BookOpen className="w-4 h-4 text-blue-600" />;
      case 'task_completed': return <Target className="w-4 h-4 text-green-600" />;
      case 'exam_attended': return <Target className="w-4 h-4 text-red-600" />;
      case 'assignment_submitted': return <Calendar className="w-4 h-4 text-purple-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
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

  // Calculate today's stats from actual sessions
  const todaysSessions = sessions.filter(session => {
    const today = new Date().toDateString();
    const sessionDate = new Date(session.created_at).toDateString();
    return sessionDate === today;
  });

  const completedSessions = todaysSessions.filter(session => session.completed_at);
  const todaysStudyTime = completedSessions
    .filter(session => session.session_type === 'work')
    .reduce((total, session) => total + session.duration_minutes, 0);

  const todaysSessionsCount = completedSessions.length;
  const totalPostInteractions = posts?.reduce((acc, post) => acc + (post.likes_count || 0) + (post.comments_count || 0), 0) || 0;

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
                  {Math.floor(todaysStudyTime / 60)}h {todaysStudyTime % 60}m
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {todaysStudyTime > 0 ? `+${todaysStudyTime}m today` : 'Start your first session'}
                </p>
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
                <p className="text-sm text-gray-600 mb-1">Sessions Today</p>
                <p className="text-3xl font-bold text-gray-900">{todaysSessionsCount}</p>
                <p className="text-xs text-purple-600 mt-1">
                  {todaysSessionsCount > 0 ? `${todaysSessionsCount} completed` : 'No sessions yet'}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Total Sessions This Week */}
          <Card className="p-6 border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Sessions This Week</p>
                <p className="text-3xl font-bold text-gray-900">
                  {statsLoading ? '...' : sessions.length}
                </p>
                <p className="text-xs text-orange-600 mt-1">
                  All focus sessions
                </p>
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
                <p className="text-3xl font-bold text-gray-900">{totalPostInteractions}</p>
                <p className="text-xs text-green-600 mt-1">
                  {totalPostInteractions > 0 ? 'Keep engaging!' : 'Share your knowledge'}
                </p>
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
        {/* Left Column - Calendar and Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <CalendarSection />
          <QuickActions />
          
          {/* Recent Activity */}
          <Card className="p-6 border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
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
        </div>

        {/* Right Column - Upcoming */}
        <div className="lg:col-span-2">
          <UpcomingSection />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
