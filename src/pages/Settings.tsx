
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Settings as SettingsIcon, Bell, Shield, Palette } from 'lucide-react';
import Header from '@/components/Header';
import NewAccountSettings from '@/components/settings/NewAccountSettings';
import NewProfileOverview from '@/components/settings/NewProfileOverview';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const sidebarItems = [
    { id: 'profile', label: 'Profile Overview', icon: User },
    { id: 'account', label: 'Account Settings', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <NewProfileOverview />;
      case 'account':
        return <NewAccountSettings />;
      case 'notifications':
        return (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Settings</h3>
              <p className="text-gray-600">Notification preferences are available in Account Settings</p>
            </CardContent>
          </Card>
        );
      case 'privacy':
        return (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Privacy & Security</h3>
              <p className="text-gray-600">Privacy and security settings are available in Account Settings</p>
            </CardContent>
          </Card>
        );
      case 'appearance':
        return (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Appearance Settings</h3>
              <p className="text-gray-600">Theme and appearance options are available in Account Settings</p>
            </CardContent>
          </Card>
        );
      default:
        return <NewProfileOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account preferences and profile information</p>
          </div>

          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-64 shrink-0">
              <Card className="border-0 shadow-sm sticky top-8">
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <Button
                          key={item.id}
                          variant="ghost"
                          className={`w-full justify-start h-11 px-3 ${
                            isActive 
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium' 
                              : 'text-gray-700 hover:bg-gray-50'
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
            <div className="flex-1 min-w-0">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
