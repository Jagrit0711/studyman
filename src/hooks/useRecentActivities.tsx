
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface RecentActivity {
  id: string;
  user_id: string;
  activity_type: 'task_completed' | 'exam_attended' | 'meeting_attended' | 'focus_session' | 'assignment_submitted';
  title: string;
  description: string | null;
  related_id: string | null;
  created_at: string;
}

export const useRecentActivities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_recent_activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      toast({
        title: "Error",
        description: "Failed to load recent activities",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addActivity = async (activity: {
    activity_type: 'task_completed' | 'exam_attended' | 'meeting_attended' | 'focus_session' | 'assignment_submitted';
    title: string;
    description?: string;
    related_id?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_recent_activities')
        .insert({
          user_id: user.id,
          ...activity
        })
        .select()
        .single();

      if (error) throw error;
      
      setActivities(prev => [data, ...prev.slice(0, 9)]);
      return data;
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
