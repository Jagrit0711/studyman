
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Camera, Clock, Users, BookOpen, Trophy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserStats } from '@/hooks/useUserStats';
import { useUserActivities } from '@/hooks/useUserActivities';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ProfileOverview = () => {
  const { user } = useAuth();
  const { profileDetails, loading: profileLoading } = useUserProfile();
  const { stats, loading: statsLoading } = useUserStats();
  const { activities, loading: activitiesLoading } = useUserActivities();
  const { toast } = useToast();
  
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  }, [user]);

  const getDisplayName = () => {
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const filePath = `${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: data.publicUrl }
      });

      if (updateError) throw updateError;

      setAvatarUrl(data.publicUrl);
      
      toast({
        title: "Success",
        description: "Profile photo updated successfully"
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload profile photo",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const statsDisplay = [
    { label: 'Study Hours', value: stats?.study_hours?.toString() || '0', icon: Clock, color: 'text-blue-600' },
    { label: 'Rooms Joined', value: stats?.rooms_joined?.toString() || '0', icon: Users, color: 'text-green-600' },
    { label: 'Sessions Led', value: stats?.sessions_led?.toString() || '0', icon: BookOpen, color: 'text-purple-600' },
    { label: 'Achievements', value: stats?.achievements?.toString() || '0', icon: Trophy, color: 'text-yellow-600' },
  ];

  if (profileLoading || statsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="notion-card">
        <CardHeader>
          <CardTitle>Profile Overview</CardTitle>
          <CardDescription>Your profile information and statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl} />
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
              <h2 className="text-2xl font-bold text-notion-gray-900 font-mono mb-2">
                {getDisplayName()}
              </h2>
              <p className="text-notion-gray-600 mb-3">{user?.email}</p>
              
              <div className="flex items-center space-x-4">
                {profileDetails?.college && <Badge variant="secondary">{profileDetails.college}</Badge>}
                {profileDetails?.major && <Badge variant="secondary">{profileDetails.major}</Badge>}
                {profileDetails?.school_year && <Badge variant="secondary">{profileDetails.school_year}</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      {/* Recent Activity */}
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
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-notion-gray-50">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.activity_type === 'joined' ? 'bg-green-500' :
                    activity.activity_type === 'created' ? 'bg-blue-500' :
                    activity.activity_type === 'completed' ? 'bg-purple-500' :
                    'bg-yellow-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-notion-gray-900">
                      {activity.activity_type.charAt(0).toUpperCase() + activity.activity_type.slice(1)} {activity.title}
                    </p>
                    <p className="text-xs text-notion-gray-500">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
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
    </div>
  );
};

export default ProfileOverview;
