
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Save, Bell } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useToast } from '@/hooks/use-toast';

const NotificationSettings = () => {
  const { settings, loading, updateSettings } = useUserSettings();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    notifications: true,
    email_notifications: true
  });

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      const newFormData = {
        notifications: settings.notifications ?? true,
        email_notifications: settings.email_notifications ?? true
      };
      setFormData(newFormData);
      setHasChanges(false);
    }
  }, [settings]);

  const handleChange = (field: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData);
      setHasChanges(false);
      toast({
        title: "Success",
        description: "Notification settings updated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
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
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-green-600" />
            <div>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive notifications and updates</CardDescription>
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
        <div className="space-y-6">
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1 flex-1">
              <Label htmlFor="notifications" className="text-sm font-medium">Push Notifications</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications about study sessions and activities</p>
            </div>
            <Switch
              id="notifications"
              checked={formData.notifications}
              onCheckedChange={(checked) => handleChange('notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between py-2">
            <div className="space-y-1 flex-1">
              <Label htmlFor="email_notifications" className="text-sm font-medium">Email Notifications</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Receive email updates about important events</p>
            </div>
            <Switch
              id="email_notifications"
              checked={formData.email_notifications}
              onCheckedChange={(checked) => handleChange('email_notifications', checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
