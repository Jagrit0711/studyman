
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  email_notifications: boolean;
  privacy_mode: boolean;
  language: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    console.log('Fetching settings for user:', user.id);

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching settings:', error);
        throw error;
      }
      
      console.log('Fetched settings:', data);

      if (!data) {
        console.log('No settings found, creating initial settings');
        // Create initial settings record if none exists
        const { data: newSettings, error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            theme: 'light',
            notifications: true,
            email_notifications: true,
            privacy_mode: false,
            language: 'en',
            timezone: 'UTC'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating settings:', insertError);
          throw insertError;
        }
        
        console.log('Created new settings:', newSettings);
        setSettings(newSettings as UserSettings);
      } else {
        setSettings(data as UserSettings);
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    if (!user) return null;

    console.log('Updating settings with:', updates);

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating settings:', error);
        throw error;
      }
      
      console.log('Updated settings:', data);
      setSettings(data as UserSettings);
      
      return data;
    } catch (error) {
      console.error('Error in updateSettings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive"
      });
      return null;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings
  };
};
