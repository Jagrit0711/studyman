
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Bell, User, Video, Users, MessageSquare, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: '/dashboard', label: 'Dashboard', icon: Users, path: '/dashboard' },
    { id: '/dashboard', label: 'Study Rooms', icon: Video, path: '/dashboard' },
    { id: '/feed', label: 'Feed', icon: MessageSquare, path: '/feed' },
    { id: '/settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 font-mono">Zylo Study</h1>
              <p className="text-xs text-gray-500">by Zylon Labs</p>
            </div>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setActiveTab(item.path)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search rooms, topics..."
                    className="pl-10 w-64 border-gray-300"
                  />
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="hidden sm:flex items-center space-x-2 border-gray-300"
                  onClick={() => navigate('/create-room')}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Room</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Bell className="w-4 h-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <User className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white border-gray-200">
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="border-gray-300">
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate('/signup')} className="bg-gray-900 hover:bg-gray-800 text-white">
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
