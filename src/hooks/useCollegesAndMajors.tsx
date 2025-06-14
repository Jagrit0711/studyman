
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface College {
  id: string;
  name: string;
  type: string;
  created_at: string;
}

interface Major {
  id: string;
  name: string;
  created_at: string;
}

export const useCollegesAndMajors = () => {
  const { toast } = useToast();
  const [colleges, setColleges] = useState<College[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all colleges
  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('name');

      if (error) throw error;
      setColleges(data || []);
    } catch (error) {
      console.error('Error fetching colleges:', error);
      toast({
        title: "Error",
        description: "Failed to load colleges",
        variant: "destructive"
      });
    }
  };

  // Fetch all majors
  const fetchMajors = async () => {
    try {
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .order('name');

      if (error) throw error;
      setMajors(data || []);
    } catch (error) {
      console.error('Error fetching majors:', error);
      toast({
        title: "Error",
        description: "Failed to load majors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new college
  const addCollege = async (name: string, type: string = 'university') => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .insert({ name, type })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "College added successfully"
      });
      
      fetchColleges();
      return data;
    } catch (error) {
      console.error('Error adding college:', error);
      toast({
        title: "Error",
        description: "Failed to add college",
        variant: "destructive"
      });
      return null;
    }
  };

  // Add new major
  const addMajor = async (name: string) => {
    try {
      const { data, error } = await supabase
        .from('majors')
        .insert({ name })
        .select()
        .single();

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Major added successfully"
      });
      
      fetchMajors();
      return data;
    } catch (error) {
      console.error('Error adding major:', error);
      toast({
        title: "Error",
        description: "Failed to add major",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchColleges();
    fetchMajors();
  }, []);

  return {
    colleges,
    majors,
    loading,
    addCollege,
    addMajor,
    refetch: () => {
      fetchColleges();
      fetchMajors();
    }
  };
};
