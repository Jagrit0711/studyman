
import { useState } from 'react';
import { User, Settings as SettingsIcon, Bell, Shield, Palette } from 'lucide-react';
import Header from '@/components/Header';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
} from '@/components/ui/sidebar';
import NewAccountSettings from '@/components/settings/NewAccountSettings';
import NewProfileOverview from '@/components/settings/NewProfileOverview';
import AppearanceSettings from '@/components/settings/AppearanceSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';

const Settings = () => {
  const [activeSection, setActiveSection] = useState('profile');

  const sidebarItems = [
    { id: 'profile', label: 'Profile Overview', icon: User },
    { id: 'account', label: 'Account Settings', icon: SettingsIcon },
    { id: 'appearance', label: 'Appearance & Language', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <NewProfileOverview />;
      case 'account':
        return <NewAccountSettings />;
      case 'appearance':
        return <AppearanceSettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'privacy':
        return <PrivacySettings />;
      default:
        return <NewProfileOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar className="border-r border-gray-200 dark:border-gray-800">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel className="text-gray-900 dark:text-gray-100">Settings</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {sidebarItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() => setActiveSection(item.id)}
                            isActive={activeSection === item.id}
                            className="w-full justify-start text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                          >
                            <Icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          
          <SidebarInset className="flex-1">
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-5xl">
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account preferences and profile information</p>
              </div>
              <div className="w-full">
                {renderContent()}
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Settings;
