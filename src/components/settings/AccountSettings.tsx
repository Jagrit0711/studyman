
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCollegesAndMajors } from '@/hooks/useCollegesAndMajors';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AccountSettings = () => {
  const { user } = useAuth();
  const { profileDetails, loading: profileLoading, saveProfileDetails } = useUserProfile();
  const { colleges, majors } = useCollegesAndMajors();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    college: '',
    major: '',
    school_year: '',
    enable_mom_mode: false
  });

  const schoolYears = [
    'Freshman',
    'Sophomore', 
    'Junior',
    'Senior',
    'Graduate',
    'PhD'
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        email: user.email || '',
        college: profileDetails?.college || '',
        major: profileDetails?.major || '',
        school_year: profileDetails?.school_year || '',
        enable_mom_mode: profileDetails?.enable_mom_mode || false
      });
    }
  }, [user, profileDetails]);

  const handleSave = async () => {
    try {
      // Update user profile in auth metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name
        }
      });

      if (userError) throw userError;

      // Update profile details
      const result = await saveProfileDetails({
        college: formData.college,
        major: formData.major,
        school_year: formData.school_year,
        enable_mom_mode: formData.enable_mom_mode
      });

      if (result) {
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Account settings updated successfully"
        });
      }

    } catch (error: any) {
      console.error('Error updating account:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update account settings",
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
      enable_mom_mode: profileDetails?.enable_mom_mode || false
    });
    setIsEditing(false);
  };

  if (profileLoading) {
    return (
      <Card className="notion-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="notion-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>Manage your account information and preferences</CardDescription>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={handleSave} className="flex items-center space-x-1">
                <Save className="w-4 h-4" />
                <span>Save</span>
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
              className="notion-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email}
              disabled={true}
              className="notion-input bg-gray-100"
            />
            <p className="text-xs text-notion-gray-500">Email cannot be changed</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="college">School/College</Label>
            {isEditing ? (
              <Select
                value={formData.college}
                onValueChange={(value) => setFormData(prev => ({ ...prev, college: value }))}
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
                value={formData.college || 'Not specified'}
                disabled={true}
                className="notion-input bg-gray-100"
              />
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="major">Major/Stream</Label>
            {isEditing ? (
              <Select
                value={formData.major}
                onValueChange={(value) => setFormData(prev => ({ ...prev, major: value }))}
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
                value={formData.major || 'Not specified'}
                disabled={true}
                className="notion-input bg-gray-100"
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
                <SelectTrigger className="notion-input">
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
                className="notion-input bg-gray-100"
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSettings;
