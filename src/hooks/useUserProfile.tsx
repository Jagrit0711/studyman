
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserProfileDetails {
  id: string;
  user_id: string;
  college: string | null;
  school_year: string | null;
  major: string | null;
  enable_mom_mode: boolean | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileDetails, setProfileDetails] = useState<UserProfileDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile details
  const fetchProfileDetails = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_profile_details')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
      setProfileDetails(data);
    } catch (error) {
      console.error('Error fetching profile details:', error);
      toast({
        title: "Error",
        description: "Failed to load profile details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save or update user profile details
  const saveProfileDetails = async (details: {
    college?: string;
    school_year?: string;
    major?: string;
    enable_mom_mode?: boolean;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_profile_details')
        .upsert({
          user_id: user.id,
          ...details,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      setProfileDetails(data);
      
      toast({
        title: "Success",
        description: "Profile details saved successfully"
      });
      
      return data;
    } catch (error) {
      console.error('Error saving profile details:', error);
      toast({
        title: "Error",
        description: "Failed to save profile details",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, [user]);

  return {
    profileDetails,
    loading,
    saveProfileDetails,
    refetch: fetchProfileDetails
  };
};
