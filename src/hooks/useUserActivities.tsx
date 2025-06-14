
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserActivity {
  id: string;
  user_id: string;
  activity_type: 'joined' | 'created' | 'completed' | 'achievement';
  title: string;
  description: string | null;
  created_at: string;
}

export const useUserActivities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Type the response properly and filter valid activity types
      const validActivities = (data || []).filter((activity): activity is UserActivity => {
        return ['joined', 'created', 'completed', 'achievement'].includes(activity.activity_type);
      });
      
      setActivities(validActivities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load activities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (activity: {
    activity_type: 'joined' | 'created' | 'completed' | 'achievement';
    title: string;
    description?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          ...activity
        })
        .select()
        .single();

      if (error) throw error;
      
      // Type check the returned data
      if (data && ['joined', 'created', 'completed', 'achievement'].includes(data.activity_type)) {
        const typedActivity = data as UserActivity;
        setActivities(prev => [typedActivity, ...prev.slice(0, 9)]);
        return typedActivity;
      }
      
      return null;
    } catch (error) {
      console.error('Error adding activity:', error);
      toast({
        title: "Error",
        description: "Failed to add activity",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [user]);

  return {
    activities,
    loading,
    addActivity,
    refetch: fetchActivities
  };
};
