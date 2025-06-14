
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Edit3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCollegesAndMajors } from '@/hooks/useCollegesAndMajors';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const NewAccountSettings = () => {
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
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold">Account Settings</CardTitle>
            <CardDescription className="mt-1">Manage your personal information and academic details</CardDescription>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button size="sm" onClick={handleSave} className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="flex items-center space-x-1">
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  disabled={!isEditing}
                  className={`${!isEditing ? 'bg-gray-50 border-gray-200' : 'border-gray-300 focus:border-blue-500'}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled={true}
                  className="bg-gray-50 border-gray-200 text-gray-500"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="college" className="text-sm font-medium text-gray-700">School/College/University</Label>
                {isEditing ? (
                  <Select
                    value={formData.college}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, college: value }))}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Select your institution" />
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
                    className="bg-gray-50 border-gray-200"
                  />
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="major" className="text-sm font-medium text-gray-700">Major/Field of Study</Label>
                {isEditing ? (
                  <Select
                    value={formData.major}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, major: value }))}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500">
                      <SelectValue placeholder="Select your major" />
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
                    className="bg-gray-50 border-gray-200"
                  />
                )}
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="school_year" className="text-sm font-medium text-gray-700">Academic Year</Label>
                {isEditing ? (
                  <Select
                    value={formData.school_year}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, school_year: value }))}
                  >
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 md:w-1/2">
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
                    className="bg-gray-50 border-gray-200 md:w-1/2"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewAccountSettings;
