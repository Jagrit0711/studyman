
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Save, Shield } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';

const PrivacySettings = () => {
  const { settings, loading: settingsLoading, updateSettings } = useUserSettings();
  const { profileDetails, loading: profileLoading, saveProfileDetails } = useUserProfile();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    privacy_mode: false,
    enable_mom_mode: false
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings && profileDetails !== undefined) {
      const newFormData = {
        privacy_mode: settings.privacy_mode ?? false,
        enable_mom_mode: profileDetails?.enable_mom_mode ?? false
      };
      setFormData(newFormData);
      setHasChanges(false);
    }
  }, [settings, profileDetails]);

  const handleChange = (field: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      // Update settings
      await updateSettings({
        privacy_mode: formData.privacy_mode
      });

      // Update profile details
      await saveProfileDetails({
        enable_mom_mode: formData.enable_mom_mode
      });

      setHasChanges(false);
      toast({
        title: "Success",
        description: "Privacy settings updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings",
        variant: "destructive"
      });
    }
  };

  if (settingsLoading || profileLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <div>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy settings and data visibility</CardDescription>
            </div>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} className="flex items-center space-x-1">
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </Button>
          )}
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
              onCheckedChange={(checked) => handleChange('privacy_mode', checked)}
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
              onCheckedChange={(checked) => handleChange('enable_mom_mode', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
