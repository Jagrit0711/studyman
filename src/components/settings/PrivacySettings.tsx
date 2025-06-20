
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, Shield, Clock, ExternalLink } from 'lucide-react';
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
      <Card className="border-0 shadow-sm animate-fade-in">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-600" />
            <div>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy settings and experimental features</CardDescription>
            </div>
          </div>
          {hasChanges && (
            <Button onClick={handleSave} className="flex items-center space-x-1 transition-all duration-200 transform hover:scale-105">
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between py-2 transition-all duration-200 hover:bg-gray-50 rounded-lg px-2">
            <div className="space-y-1 flex-1">
              <Label htmlFor="privacy_mode" className="text-sm font-medium">Privacy Mode</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Hide your activity status from other users</p>
            </div>
            <Switch
              id="privacy_mode"
              checked={formData.privacy_mode}
              onCheckedChange={(checked) => handleChange('privacy_mode', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between py-2 transition-all duration-200 hover:bg-purple-50 rounded-lg px-2">
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <Label htmlFor="enable_mom_mode" className="text-sm font-medium">Mom Mode</Label>
                <Badge variant="outline" className="text-xs border-purple-300 text-purple-600 bg-purple-50">
                  Beta
                </Badge>
                <Clock className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get motivational (and slightly nagging) reminders when you're procrastinating on the focus page
              </p>
              <p className="text-xs text-purple-600">
                Mom will encourage you to start working and type faster, just like... well, your mom!
              </p>
            </div>
            <Switch
              id="enable_mom_mode"
              checked={formData.enable_mom_mode}
              onCheckedChange={(checked) => handleChange('enable_mom_mode', checked)}
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">Legal Information</h3>
          <div className="flex flex-col space-y-2">
            <Link 
              to="/privacy-policy" 
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Privacy Policy
              <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
            <Link 
              to="/terms-conditions" 
              className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              Terms & Conditions
              <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrivacySettings;
