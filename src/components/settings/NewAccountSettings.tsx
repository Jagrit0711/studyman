
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, X, User, Shield, Bell, Palette, Clock, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useCollegesAndMajors } from '@/hooks/useCollegesAndMajors';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const NewAccountSettings = () => {
  const { user } = useAuth();
  const { profileDetails, loading: profileLoading, saveProfileDetails } = useUserProfile();
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const { colleges, majors } = useCollegesAndMajors();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    college: '',
    major: '',
    school_year: '',
    enable_mom_mode: false,
    theme: 'light' as 'light' | 'dark' | 'system',
    notifications: true,
    email_notifications: true,
    privacy_mode: false,
    language: 'en',
    timezone: 'UTC'
  });

  const schoolYears = [
    'Freshman',
    'Sophomore', 
    'Junior',
    'Senior',
    'Graduate',
    'PhD'
  ];

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'zh', label: 'Chinese' }
  ];

  const timezones = [
    { value: 'UTC', label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'Europe/London', label: 'London' },
    { value: 'Europe/Paris', label: 'Paris' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Australia/Sydney', label: 'Sydney' }
  ];

  useEffect(() => {
    console.log('Profile details:', profileDetails);
    console.log('Settings:', settings);
    console.log('User:', user);
    
    if (user && profileDetails !== undefined && settings !== undefined) {
      setFormData({
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        college: profileDetails?.college || '',
        major: profileDetails?.major || '',
        school_year: profileDetails?.school_year || '',
        enable_mom_mode: profileDetails?.enable_mom_mode || false,
        theme: settings?.theme || 'light',
        notifications: settings?.notifications ?? true,
        email_notifications: settings?.email_notifications ?? true,
        privacy_mode: settings?.privacy_mode ?? false,
        language: settings?.language || 'en',
        timezone: settings?.timezone || 'UTC'
      });
    }
  }, [user, profileDetails, settings]);

  const handleSave = async () => {
    try {
      console.log('Saving form data:', formData);
      
      // Update user profile in auth metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name
        }
      });

      if (userError) throw userError;

      // Update profile details
      const profileResult = await saveProfileDetails({
        college: formData.college,
        major: formData.major,
        school_year: formData.school_year,
        enable_mom_mode: formData.enable_mom_mode
      });

      // Update settings
      const settingsResult = await updateSettings({
        theme: formData.theme,
        notifications: formData.notifications,
        email_notifications: formData.email_notifications,
        privacy_mode: formData.privacy_mode,
        language: formData.language,
        timezone: formData.timezone
      });

      if (profileResult && settingsResult) {
        setIsEditing(false);
        toast({
          title: "Success",
          description: "All settings updated successfully"
        });
      }

    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || '',
      email: user?.email || '',
      college: profileDetails?.college || '',
      major: profileDetails?.major || '',
      school_year: profileDetails?.school_year || '',
      enable_mom_mode: profileDetails?.enable_mom_mode || false,
      theme: settings?.theme || 'light',
      notifications: settings?.notifications ?? true,
      email_notifications: settings?.email_notifications ?? true,
      privacy_mode: settings?.privacy_mode ?? false,
      language: settings?.language || 'en',
      timezone: settings?.timezone || 'UTC'
    });
    setIsEditing(false);
  };

  if (profileLoading || settingsLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Information */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Manage your personal details and academic information</CardDescription>
              </div>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button size="sm" onClick={handleSave} className="flex items-center space-x-1">
                  <Save className="w-4 h-4" />
                  <span>Save All</span>
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel} className="flex items-center space-x-1">
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                disabled={!isEditing}
                className={!isEditing ? "bg-gray-50" : ""}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={formData.email}
                disabled={true}
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="college">School/College/University</Label>
              {isEditing ? (
                <Select
                  value={formData.college}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, college: value }))}
                >
                  <SelectTrigger>
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
                  value={formData.college || 'Not specified'}
                  disabled={true}
                  className="bg-gray-50"
                />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="major">Major/Field of Study</Label>
              {isEditing ? (
                <Select
                  value={formData.major}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, major: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your major/field" />
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
                  value={formData.major || 'Not specified'}
                  disabled={true}
                  className="bg-gray-50"
                />
              )}
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="school_year">Academic Year</Label>
              {isEditing ? (
                <Select
                  value={formData.school_year}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, school_year: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your academic year" />
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
                  value={formData.school_year || 'Not specified'}
                  disabled={true}
                  className="bg-gray-50"
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Appearance Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Palette className="w-5 h-5 text-purple-600" />
            <div>
              <CardTitle>Appearance & Language</CardTitle>
              <CardDescription>Customize your visual preferences and language settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={formData.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => setFormData(prev => ({ ...prev, theme: value }))}
                disabled={!isEditing}
              >
                <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themes.map((theme) => (
                    <SelectItem key={theme.value} value={theme.value}>
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                disabled={!isEditing}
              >
                <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="timezone" className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Timezone</span>
              </Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                disabled={!isEditing}
              >
                <SelectTrigger className={!isEditing ? "bg-gray-50" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Notification Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-green-600" />
            <div>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive notifications and updates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-sm text-gray-500">Receive notifications about study sessions and activities</p>
              </div>
              <Switch
                id="notifications"
                checked={formData.notifications}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notifications: checked }))}
                disabled={!isEditing}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <p className="text-sm text-gray-500">Receive email updates about important events</p>
              </div>
              <Switch
                id="email_notifications"
                checked={formData.email_notifications}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, email_notifications: checked }))}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Privacy Settings */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <div>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy settings and data visibility</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="privacy_mode">Privacy Mode</Label>
                <p className="text-sm text-gray-500">Hide your activity status from other users</p>
              </div>
              <Switch
                id="privacy_mode"
                checked={formData.privacy_mode}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, privacy_mode: checked }))}
                disabled={!isEditing}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enable_mom_mode">Mom Mode</Label>
                <p className="text-sm text-gray-500">Extra features for parental oversight and encouragement</p>
              </div>
              <Switch
                id="enable_mom_mode"
                checked={formData.enable_mom_mode}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enable_mom_mode: checked }))}
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewAccountSettings;
