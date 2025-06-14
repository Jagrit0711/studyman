
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Camera, BookOpen, Users, Clock, Trophy, Settings } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCollegesAndMajors } from '@/hooks/useCollegesAndMajors';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { profileDetails, loading: profileLoading, saveProfileDetails } = useUserProfile();
  const { colleges, majors } = useCollegesAndMajors();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    college: '',
    major: '',
    school_year: '',
    enable_mom_mode: false
  });
  const [userProfile, setUserProfile] = useState({
    full_name: '',
    email: '',
    avatar_url: ''
  });

  // Load user data when available
  useEffect(() => {
    if (user) {
      setUserProfile({
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        avatar_url: user.user_metadata?.avatar_url || ''
      });
    }
  }, [user]);

  // Load profile details when available
  useEffect(() => {
    if (profileDetails) {
      setProfileData({
        full_name: userProfile.full_name,
        email: userProfile.email,
        college: profileDetails.college || '',
        major: profileDetails.major || '',
        school_year: profileDetails.school_year || '',
        enable_mom_mode: profileDetails.enable_mom_mode || false
      });
    } else if (user) {
      setProfileData({
        full_name: userProfile.full_name,
        email: userProfile.email,
        college: '',
        major: '',
        school_year: '',
        enable_mom_mode: false
      });
    }
  }, [profileDetails, userProfile, user]);

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

  const schoolYears = [
    'Freshman',
    'Sophomore', 
    'Junior',
    'Senior',
    'Graduate',
    'PhD'
  ];

  const handleSave = async () => {
    try {
      // Update user profile in auth.users metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name
        }
      });

      if (userError) throw userError;

      // Update profile details
      await saveProfileDetails({
        college: profileData.college,
        major: profileData.major,
        school_year: profileData.school_year,
        enable_mom_mode: profileData.enable_mom_mode
      });

      setIsEditing(false);
      
      // Update local user profile state
      setUserProfile(prev => ({
        ...prev,
        full_name: profileData.full_name
      }));

    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    }
  };

  const getDisplayName = () => {
    return profileData.full_name || userProfile.full_name || user?.email?.split('@')[0] || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-notion-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                    <AvatarImage src={userProfile.avatar_url} />
                    <AvatarFallback className="text-lg font-semibold bg-notion-gray-100">
                      {getInitials()}
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
                      {getDisplayName()}
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
                    {profileData.college && <Badge variant="secondary">{profileData.college}</Badge>}
                    {profileData.major && <Badge variant="secondary">{profileData.major}</Badge>}
                    {profileData.school_year && <Badge variant="secondary">{profileData.school_year}</Badge>}
                  </div>
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
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
                        value={profileData.full_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                        disabled={!isEditing}
                        className="notion-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={profileData.email}
                        disabled={true}
                        className="notion-input bg-gray-100"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="college">College/University</Label>
                      {isEditing ? (
                        <Select
                          value={profileData.college}
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, college: value }))}
                        >
                          <SelectTrigger className="notion-input">
                            <SelectValue placeholder="Select your college" />
                          </SelectTrigger>
                          <SelectContent>
                            {colleges.map((college) => (
                              <SelectItem key={college.id} value={college.name}>
                                {college.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="college"
                          value={profileData.college}
                          disabled={true}
                          className="notion-input bg-gray-100"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">Major</Label>
                      {isEditing ? (
                        <Select
                          value={profileData.major}
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, major: value }))}
                        >
                          <SelectTrigger className="notion-input">
                            <SelectValue placeholder="Select your major" />
                          </SelectTrigger>
                          <SelectContent>
                            {majors.map((major) => (
                              <SelectItem key={major.id} value={major.name}>
                                {major.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="major"
                          value={profileData.major}
                          disabled={true}
                          className="notion-input bg-gray-100"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="school_year">School Year</Label>
                      {isEditing ? (
                        <Select
                          value={profileData.school_year}
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, school_year: value }))}
                        >
                          <SelectTrigger className="notion-input">
                            <SelectValue placeholder="Select your year" />
                          </SelectTrigger>
                          <SelectContent>
                            {schoolYears.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id="school_year"
                          value={profileData.school_year}
                          disabled={true}
                          className="notion-input bg-gray-100"
                        />
                      )}
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
