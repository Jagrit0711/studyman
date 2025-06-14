
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Settings as SettingsIcon, Bell, Shield, Palette } from 'lucide-react';
import Header from '@/components/Header';
import AccountSettings from '@/components/settings/AccountSettings';
import ProfileOverview from '@/components/settings/ProfileOverview';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const sidebarItems = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileOverview />;
      case 'account':
        return <AccountSettings />;
      case 'notifications':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-notion-gray-600">Notification settings coming soon...</p>
            </CardContent>
          </Card>
        );
      case 'privacy':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Security</CardTitle>
              <CardDescription>Manage your privacy and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-notion-gray-600">Privacy settings coming soon...</p>
            </CardContent>
          </Card>
        );
      case 'appearance':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-notion-gray-600">Appearance settings coming soon...</p>
            </CardContent>
          </Card>
        );
      default:
        return <ProfileOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-notion-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-notion-gray-900 font-mono">Settings</h1>
            <p className="text-notion-gray-600 mt-2">Manage your account and preferences</p>
          </div>

          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-64 shrink-0">
              <Card className="notion-card">
                <CardContent className="p-4">
                  <nav className="space-y-2">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Button
                          key={item.id}
                          variant={activeSection === item.id ? "secondary" : "ghost"}
                          className={`w-full justify-start ${
                            activeSection === item.id 
                              ? 'bg-notion-gray-100 text-notion-gray-900' 
                              : 'text-notion-gray-600 hover:bg-notion-gray-50'
                          }`}
                          onClick={() => setActiveSection(item.id)}
                        >
                          <Icon className="w-4 h-4 mr-3" />
                          {item.label}
                        </Button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
