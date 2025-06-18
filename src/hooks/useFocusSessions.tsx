
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface FocusSession {
  id: string;
  user_id: string;
  session_type: 'work' | 'shortBreak' | 'longBreak';
  duration_minutes: number;
  task_title: string | null;
  started_at: string;
  completed_at: string | null;
  google_calendar_event_id: string | null;
  created_at: string;
  updated_at: string;
}

export const useFocusSessions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<FocusSession | null>(null);

  const isValidSessionType = (type: string): type is 'work' | 'shortBreak' | 'longBreak' => {
    return ['work', 'shortBreak', 'longBreak'].includes(type);
  };

  const fetchSessions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Filter and type-cast the data to ensure type safety
      const validSessions = (data || []).filter((session): session is FocusSession => 
        isValidSessionType(session.session_type)
      );
      
      setSessions(validSessions);
      
      // Check for active session (one that's started but not completed)
      const active = validSessions.find(session => 
        session.completed_at === null
      );
      setActiveSession(active || null);
    } catch (error) {
      console.error('Error fetching focus sessions:', error);
      toast({
        title: "Error",
        description: "Failed to load focus sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (sessionData: {
    session_type: 'work' | 'shortBreak' | 'longBreak';
    duration_minutes: number;
    task_title?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert({
          user_id: user.id,
          ...sessionData
        })
        .select()
        .single();

      if (error) throw error;
      
      // Type-cast the returned data
      if (data && isValidSessionType(data.session_type)) {
        const typedSession = data as FocusSession;
        setActiveSession(typedSession);
        setSessions(prev => [typedSession, ...prev]);
        return typedSession;
      }
      
      return null;
    } catch (error) {
      console.error('Error starting focus session:', error);
      toast({
        title: "Error",
        description: "Failed to start focus session",
        variant: "destructive"
      });
      return null;
    }
  };

  const completeSession = async (sessionId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('focus_sessions')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Type-cast the returned data
      if (data && isValidSessionType(data.session_type)) {
        const typedSession = data as FocusSession;
        setActiveSession(null);
        setSessions(prev => 
          prev.map(session => 
            session.id === sessionId ? typedSession : session
          )
        );
        
        toast({
          title: "Session Complete!",
          description: "Your focus session has been recorded",
        });
        
        return typedSession;
      }
      
      return null;
    } catch (error) {
      console.error('Error completing focus session:', error);
      toast({
        title: "Error",
        description: "Failed to complete focus session",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user]);

  return {
    sessions,
    loading,
    activeSession,
    startSession,
    completeSession,
    refetch: fetchSessions
  };
};
