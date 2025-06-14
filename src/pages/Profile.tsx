
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Edit, Camera, BookOpen, Users, Clock, Trophy, Settings } from 'lucide-react';
import Header from '@/components/Header';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    bio: 'Computer Science student passionate about algorithms and machine learning. Always looking for study partners!',
    university: 'MIT',
    major: 'Computer Science',
    year: 'Junior'
  });

  const stats = [
    { label: 'Study Hours', value: '127', icon: Clock, color: 'text-blue-600' },
    { label: 'Rooms Joined', value: '23', icon: Users, color: 'text-green-600' },
    { label: 'Sessions Led', value: '8', icon: BookOpen, color: 'text-purple-600' },
    { label: 'Achievements', value: '12', icon: Trophy, color: 'text-yellow-600' },
  ];

  const recentActivity = [
    { type: 'joined', title: 'Advanced Calculus Study Group', time: '2 hours ago' },
    { type: 'created', title: 'Machine Learning Discussion', time: '1 day ago' },
    { type: 'completed', title: 'Physics Problem Set Review', time: '2 days ago' },
    { type: 'joined', title: 'Data Structures & Algorithms', time: '3 days ago' },
  ];

  const subjects = ['Computer Science', 'Mathematics', 'Physics', 'Machine Learning', 'Algorithms'];

  const handleSave = () => {
    setIsEditing(false);
    console.log('Profile updated:', profileData);
  };

  return (
    <div className="min-h-screen bg-notion-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="notion-card mb-6">
            <CardContent className="p-6">
              <div className="flex items-start space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="text-lg font-semibold bg-notion-gray-100">
                      {profileData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-notion-gray-900 font-mono">
                      {profileData.name}
                    </h1>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center space-x-2"
                    >
                      {isEditing ? <Settings className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                      <span>{isEditing ? 'Settings' : 'Edit Profile'}</span>
                    </Button>
                  </div>
                  
                  <p className="text-notion-gray-600 mb-3">{profileData.email}</p>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <Badge variant="secondary">{profileData.university}</Badge>
                    <Badge variant="secondary">{profileData.major}</Badge>
                    <Badge variant="secondary">{profileData.year}</Badge>
                  </div>
                  
                  <p className="text-notion-gray-700">{profileData.bio}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="notion-card">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-notion-gray-600">{stat.label}</p>
                        <p className="text-xl font-bold text-notion-gray-900">{stat.value}</p>
                      </div>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
              <TabsTrigger value="subjects">Study Subjects</TabsTrigger>
              <TabsTrigger value="settings">Account Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="activity" className="space-y-4">
              <Card className="notion-card">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest study sessions and interactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-notion-gray-50">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'joined' ? 'bg-green-500' :
                          activity.type === 'created' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-notion-gray-900">
                            {activity.type === 'joined' ? 'Joined' :
                             activity.type === 'created' ? 'Created' :
                             'Completed'} {activity.title}
                          </p>
                          <p className="text-xs text-notion-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="subjects" className="space-y-4">
              <Card className="notion-card">
                <CardHeader>
                  <CardTitle>Study Subjects</CardTitle>
                  <CardDescription>Subjects you're currently studying</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subject, index) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <Card className="notion-card">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={!isEditing}
                        className="notion-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        disabled={!isEditing}
                        className="notion-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Input
                        id="university"
                        value={profileData.university}
                        onChange={(e) => setProfileData(prev => ({ ...prev, university: e.target.value }))}
                        disabled={!isEditing}
                        className="notion-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">Major</Label>
                      <Input
                        id="major"
                        value={profileData.major}
                        onChange={(e) => setProfileData(prev => ({ ...prev, major: e.target.value }))}
                        disabled={!isEditing}
                        className="notion-input"
                      />
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleSave} className="bg-notion-gray-900 hover:bg-notion-gray-800">
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
