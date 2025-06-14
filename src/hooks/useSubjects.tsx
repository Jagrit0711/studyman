
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Subject {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  created_at: string;
}

interface UserSubject {
  id: string;
  subject_id: string;
  subjects: Subject;
}

export const useSubjects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [userSubjects, setUserSubjects] = useState<UserSubject[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all available subjects
  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('name');

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive"
      });
    }
  };

  // Fetch user's selected subjects
  const fetchUserSubjects = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_subjects')
        .select(`
          id,
          subject_id,
          subjects (
            id,
            name,
            icon,
            color,
            created_at
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setUserSubjects(data || []);
    } catch (error) {
      console.error('Error fetching user subjects:', error);
      toast({
        title: "Error",
        description: "Failed to load your subjects",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add subject to user's list
  const addUserSubject = async (subjectId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_subjects')
        .insert({
          user_id: user.id,
          subject_id: subjectId
        });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Subject added to your list"
      });
      
      fetchUserSubjects();
    } catch (error) {
      console.error('Error adding subject:', error);
      toast({
        title: "Error",
        description: "Failed to add subject",
        variant: "destructive"
      });
    }
  };

  // Remove subject from user's list
  const removeUserSubject = async (subjectId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_subjects')
        .delete()
        .eq('user_id', user.id)
        .eq('subject_id', subjectId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Subject removed from your list"
      });
      
      fetchUserSubjects();
    } catch (error) {
      console.error('Error removing subject:', error);
      toast({
        title: "Error",
        description: "Failed to remove subject",
        variant: "destructive"
      });
    }
  };

  // Add new subject to database
  const addNewSubject = async (name: string, icon: string = '📚', color: string = '#6B7280') => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({ 
          name: name.trim(), 
          icon,
          color
        })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "New subject added successfully"
      });
      
      // Refresh subjects list
      await fetchSubjects();
      
      return data;
    } catch (error) {
      console.error('Error adding new subject:', error);
      toast({
        title: "Error",
        description: "Failed to add new subject",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserSubjects();
    } else {
      setUserSubjects([]);
      setLoading(false);
    }
  }, [user]);

  return {
    subjects,
    userSubjects,
    loading,
    addUserSubject,
    removeUserSubject,
    addNewSubject,
    refetch: () => {
      fetchSubjects();
      fetchUserSubjects();
    }
  };
};
