
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Camera, BookOpen, Users, Clock, Trophy, Save, X } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCollegesAndMajors } from '@/hooks/useCollegesAndMajors';
import { useUserActivities } from '@/hooks/useUserActivities';
import { useUserStats } from '@/hooks/useUserStats';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { profileDetails, loading: profileLoading, saveProfileDetails } = useUserProfile();
  const { colleges, majors } = useCollegesAndMajors();
  const { activities, loading: activitiesLoading } = useUserActivities();
  const { stats, loading: statsLoading } = useUserStats();
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
  const [uploading, setUploading] = useState(false);

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

  // Display real stats or default to 0
  const statsDisplay = [
    { label: 'Study Hours', value: stats?.study_hours?.toString() || '0', icon: Clock, color: 'text-blue-600' },
    { label: 'Rooms Joined', value: stats?.rooms_joined?.toString() || '0', icon: Users, color: 'text-green-600' },
    { label: 'Sessions Led', value: stats?.sessions_led?.toString() || '0', icon: BookOpen, color: 'text-purple-600' },
    { label: 'Achievements', value: stats?.achievements?.toString() || '0', icon: Trophy, color: 'text-yellow-600' },
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

  const handleCancel = () => {
    // Reset form data to original values
    if (profileDetails) {
      setProfileData({
        full_name: userProfile.full_name,
        email: userProfile.email,
        college: profileDetails.college || '',
        major: profileDetails.major || '',
        school_year: profileDetails.school_year || '',
        enable_mom_mode: profileDetails.enable_mom_mode || false
      });
    }
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: data.publicUrl
        }
      });

      if (updateError) throw updateError;

      setUserProfile(prev => ({
        ...prev,
        avatar_url: data.publicUrl
      }));

      toast({
        title: "Success",
        description: "Profile photo updated successfully"
      });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile photo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getDisplayName = () => {
    return profileData.full_name || userProfile.full_name || user?.email?.split('@')[0] || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'joined': return 'bg-green-500';
      case 'created': return 'bg-blue-500';
      case 'completed': return 'bg-purple-500';
      case 'achievement': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (profileLoading || statsLoading) {
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
                  <div className="absolute -bottom-2 -right-2">
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full w-8 h-8 p-0"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={uploading}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-notion-gray-900 font-mono">
                      {getDisplayName()}
                    </h1>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Profile</span>
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="flex items-center space-x-1"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          className="flex items-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </Button>
                      </div>
                    )}
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
            {statsDisplay.map((stat, index) => {
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
                  {activitiesLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse h-16 bg-gray-200 rounded-lg"></div>
                      ))}
                    </div>
                  ) : activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-notion-gray-50">
                          <div className={`w-2 h-2 rounded-full ${getActivityColor(activity.activity_type)}`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-notion-gray-900">
                              {activity.activity_type.charAt(0).toUpperCase() + activity.activity_type.slice(1)} {activity.title}
                            </p>
                            <p className="text-xs text-notion-gray-500">{getTimeAgo(activity.created_at)}</p>
                            {activity.description && (
                              <p className="text-xs text-notion-gray-600 mt-1">{activity.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-notion-gray-500">No recent activities found. Start studying to see your activity here!</p>
                    </div>
                  )}
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
                      <Label htmlFor="college">School/College</Label>
                      {isEditing ? (
                        <Select
                          value={profileData.college}
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, college: value }))}
                        >
                          <SelectTrigger className="notion-input">
                            <SelectValue placeholder="Select your school/college" />
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
                          value={profileData.college || 'Not specified'}
                          disabled={true}
                          className="notion-input bg-gray-100"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="major">Major/Stream</Label>
                      {isEditing ? (
                        <Select
                          value={profileData.major}
                          onValueChange={(value) => setProfileData(prev => ({ ...prev, major: value }))}
                        >
                          <SelectTrigger className="notion-input">
                            <SelectValue placeholder="Select your major/stream" />
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
                          value={profileData.major || 'Not specified'}
                          disabled={true}
                          className="notion-input bg-gray-100"
                        />
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="school_year">Year</Label>
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
                          value={profileData.school_year || 'Not specified'}
                          disabled={true}
                          className="notion-input bg-gray-100"
                        />
                      )}
                    </div>
                  </div>
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
