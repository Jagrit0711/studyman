
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, TrendingUp, Clock, Users, MessageSquare, Plus, Hash } from 'lucide-react';
import Header from '@/components/Header';
import CreatePost from '@/components/CreatePost';
import FeedPost from '@/components/FeedPost';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';

const Feed = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [activeTab, setActiveTab] = useState('all');
  const { posts, isLoading } = usePosts();
  const { user } = useAuth();

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'History', 'Literature', 'Psychology', 'Economics', 'Art', 'Music', 'Other'
  ];

  const trendingTopics = [
    'Calculus Help', 'Study Groups', 'Exam Prep', 'Research Papers', 
    'Lab Reports', 'Assignment Help', 'Career Advice', 'Internships'
  ];

  const filteredPosts = posts?.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = selectedSubject === 'all' || post.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  }) || [];

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === 'popular') {
      return (b.likes_count + b.comments_count) - (a.likes_count + a.comments_count);
    } else if (sortBy === 'discussed') {
      return b.comments_count - a.comments_count;
    }
    return 0;
  });

  const stats = [
    { label: 'Total Posts', value: posts?.length || 0, icon: MessageSquare },
    { label: 'Active Users', value: '156', icon: Users },
    { label: 'Trending', value: '24', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Feed</h1>
              <p className="text-gray-600">Connect, share, and learn with your study community</p>
            </div>
            {user && (
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="p-4 border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <Icon className="w-8 h-8 text-gray-400" />
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Search and Filters */}
            <Card className="p-4 border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Search & Filter</h3>
              
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300"
                  />
                </div>

                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        Most Recent
                      </div>
                    </SelectItem>
                    <SelectItem value="popular">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Most Popular
                      </div>
                    </SelectItem>
                    <SelectItem value="discussed">
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Most Discussed
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Trending Topics */}
            <Card className="p-4 border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Trending Topics</h3>
              <div className="space-y-2">
                {trendingTopics.map((topic, index) => (
                  <button
                    key={index}
                    className="flex items-center w-full text-left p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Hash className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{topic}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Active Subjects */}
            <Card className="p-4 border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Popular Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {subjects.slice(0, 8).map((subject) => (
                  <Badge
                    key={subject}
                    variant={selectedSubject === subject ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedSubject === subject
                        ? 'bg-gray-900 text-white'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedSubject(subject)}
                  >
                    {subject}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100">
                <TabsTrigger value="all" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                  All Posts
                </TabsTrigger>
                <TabsTrigger value="following" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                  Following
                </TabsTrigger>
                <TabsTrigger value="my-posts" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white">
                  My Posts
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {user && <CreatePost />}
                
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading posts...</p>
                  </div>
                ) : sortedPosts.length > 0 ? (
                  <div className="space-y-6">
                    {sortedPosts.map((post) => (
                      <FeedPost key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <Card className="p-12 text-center border-gray-200">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery || selectedSubject !== 'all' 
                        ? 'Try adjusting your filters or search terms'
                        : 'Be the first to share something with the community!'
                      }
                    </p>
                    {user && (
                      <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Post
                      </Button>
                    )}
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="following" className="space-y-6">
                <Card className="p-12 text-center border-gray-200">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Following Feed</h3>
                  <p className="text-gray-600">Follow other users to see their posts here</p>
                </Card>
              </TabsContent>

              <TabsContent value="my-posts" className="space-y-6">
                {user ? (
                  <div className="space-y-6">
                    {sortedPosts.filter(post => post.user_id === user.id).length > 0 ? (
                      sortedPosts
                        .filter(post => post.user_id === user.id)
                        .map((post) => <FeedPost key={post.id} post={post} />)
                    ) : (
                      <Card className="p-12 text-center border-gray-200">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                        <p className="text-gray-600 mb-6">Share your thoughts with the community</p>
                        <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Post
                        </Button>
                      </Card>
                    )}
                  </div>
                ) : (
                  <Card className="p-12 text-center border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign in required</h3>
                    <p className="text-gray-600">Please sign in to view your posts</p>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
