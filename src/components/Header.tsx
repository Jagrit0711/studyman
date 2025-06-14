
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Bell, User, Video, Users, MessageSquare } from 'lucide-react';

const Header = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Users, path: '/' },
    { id: 'rooms', label: 'Study Rooms', icon: Video, path: '/' },
    { id: 'feed', label: 'Feed', icon: MessageSquare, path: '/' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-notion-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-notion-gray-800 to-notion-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm font-mono">Z</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-notion-gray-900 font-mono">Zylo Study</h1>
              <p className="text-xs text-notion-gray-500">by Zylon Labs</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-notion-gray-100 text-notion-gray-900'
                      : 'text-notion-gray-600 hover:bg-notion-gray-50 hover:text-notion-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Search and Actions */}
          <div className="flex items-center space-x-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 w-4 h-4" />
              <Input
                placeholder="Search rooms, topics..."
                className="pl-10 w-64 notion-input"
              />
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex items-center space-x-2"
              onClick={() => navigate('/create-room')}
            >
              <Plus className="w-4 h-4" />
              <span>Create Room</span>
            </Button>
            
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/profile')}
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
