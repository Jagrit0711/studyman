
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import AnimatedMomAvatar from '@/components/AnimatedMomAvatar';

const GlobalMomMode = () => {
  const { user } = useAuth();
  const { settings, loading } = useUserSettings();
  const location = useLocation();
  const [showMomDialog, setShowMomDialog] = useState(false);
  const [userReply, setUserReply] = useState('');
  const [conversation, setConversation] = useState<{ sender: 'mom' | 'user', message: string, mood?: string }[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [lastPageChange, setLastPageChange] = useState(Date.now());
  const [currentMood, setCurrentMood] = useState<'happy' | 'stern' | 'encouraging' | 'nagging' | 'proud'>('stern');
  const [lastTypingTime, setLastTypingTime] = useState(Date.now());
  const [typingSpeed, setTypingSpeed] = useState(0);
  const [isTypingSlow, setIsTypingSlow] = useState(false);
  const [keystrokes, setKeystrokes] = useState(0);

  // Don't show Mom Mode if user is not authenticated
  if (!user) {
    console.log('GlobalMomMode: User not authenticated, not showing Mom Mode');
    return null;
  }

  // Don't show Mom Mode on landing page or auth pages
  const excludedPaths = ['/', '/login', '/signup', '/onboarding'];
  if (excludedPaths.includes(location.pathname)) {
    console.log('GlobalMomMode: On excluded path, not showing Mom Mode:', location.pathname);
    return null;
  }

  // Check if Mom Mode is enabled
  const isMomModeEnabled = settings?.enable_mom_mode === true;

  console.log('GlobalMomMode render:', { 
    isMomModeEnabled, 
    settings,
    loading,
    user: !!user,
    currentPath: location.pathname,
    typingSpeed,
    isTypingSlow
  });

  // Don't render if still loading settings
  if (loading) {
    console.log('GlobalMomMode: Still loading settings');
    return null;
  }

  // Don't render if Mom Mode is not enabled
  if (!isMomModeEnabled) {
    console.log('GlobalMomMode: Mom Mode not enabled');
    return null;
  }

  const momMessages = {
    procrastinating: {
      messages: [
        "Hey! Stop scrolling and get back to studying!",
        "I didn't raise you to waste time on social media!",
        "Your future self will thank you for studying now instead of procrastinating!",
        "Close that chat and open your books, young one!",
        "You think success comes from chatting? GET TO WORK!",
      ],
      mood: 'nagging' as const
    },
    pageHopping: {
      messages: [
        "Stop jumping between pages and focus on one thing!",
        "You're like a butterfly - land somewhere and STUDY!",
        "Pick a page and stick with it, honey!",
        "All this clicking around won't help your grades!",
      ],
      mood: 'stern' as const
    },
    slowTyping: {
      messages: [
        "Come on! Type faster! Your thoughts are moving slower than molasses!",
        "Are you typing with your toes? Speed it up!",
        "I've seen turtles type faster than you!",
        "Focus! Your typing is as slow as your progress!",
      ],
      mood: 'nagging' as const
    },
    dashboardIdle: {
      messages: [
        "You're just staring at the dashboard! Do something productive!",
        "The dashboard won't study for you - get moving!",
        "Stop admiring your stats and start improving them!",
        "Looking at your dashboard won't make your grades better!",
      ],
      mood: 'stern' as const
    },
    motivational: {
      messages: [
        "I know you can do better than this, sweetheart.",
        "Remember why you started - now finish what you began!",
        "Success is just one focused session away!",
        "Your future career is waiting for you to get serious!",
      ],
      mood: 'encouraging' as const
    },
    feedPageSpecific: {
      messages: [
        "Why are you chatting when you should be studying?!",
        "These posts won't help you pass your exams!",
        "Stop gossiping and start focusing on your future!",
        "Real talk: your grades matter more than this feed!",
      ],
      mood: 'stern' as const
    }
  };

  // Track user activity and typing
  useEffect(() => {
    if (!isMomModeEnabled) return;
    
    let keystrokeCount = 0;
    let startTime = Date.now();
    
    const updateActivity = () => setLastActivityTime(Date.now());
    
    const handleKeyPress = (e: KeyboardEvent) => {
      const now = Date.now();
      setLastActivityTime(now);
      setLastTypingTime(now);
      
      keystrokeCount++;
      setKeystrokes(keystrokeCount);
      
      // Calculate typing speed (characters per minute)
      const timeElapsed = (now - startTime) / 1000 / 60; // minutes
      const currentSpeed = keystrokeCount / timeElapsed;
      setTypingSpeed(Math.round(currentSpeed));
      
      // Consider typing slow if less than 30 CPM
      setIsTypingSlow(currentSpeed < 30 && keystrokeCount > 10);
      
      console.log('Typing speed:', currentSpeed, 'CPM, keystrokes:', keystrokeCount);
    };
    
    const events = ['mousedown', 'mousemove', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });
    
    document.addEventListener('keypress', handleKeyPress);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [isMomModeEnabled]);

  // Track page changes
  useEffect(() => {
    if (!isMomModeEnabled) return;
    
    setLastPageChange(Date.now());
    console.log('Page changed to:', location.pathname);
    
    // Reset typing metrics on page change
    setKeystrokes(0);
    setTypingSpeed(0);
    setIsTypingSlow(false);
  }, [location.pathname, isMomModeEnabled]);

  // Mom's nagging logic with dashboard-specific detection
  useEffect(() => {
    if (!isMomModeEnabled) return;

    console.log('Setting up Mom nagging interval for path:', location.pathname);

    const checkForNagging = () => {
      const timeSinceActivity = Date.now() - lastActivityTime;
      const timeSincePageChange = Date.now() - lastPageChange;
      const timeSinceTyping = Date.now() - lastTypingTime;
      
      console.log('Checking for nagging:', {
        timeSinceActivity,
        timeSincePageChange,
        timeSinceTyping,
        currentPath: location.pathname,
        showMomDialog,
        typingSpeed,
        isTypingSlow
      });
      
      let shouldNag = false;
      let messageType: keyof typeof momMessages = 'procrastinating';

      // Dashboard-specific nagging
      if (location.pathname === '/dashboard') {
        if (timeSinceActivity > 10000) { // 10 seconds idle on dashboard
          shouldNag = true;
          messageType = 'dashboardIdle';
          console.log('Should nag: Dashboard idle timeout');
        }
      }

      // Slow typing detection (when user is typing but slowly)
      if (isTypingSlow && timeSinceTyping < 5000) {
        shouldNag = true;
        messageType = 'slowTyping';
        console.log('Should nag: Slow typing detected');
      }
      
      // On feed page - nag more aggressively
      if (location.pathname === '/feed') {
        if (timeSinceActivity > 8000) { // 8 seconds of being on feed
          shouldNag = true;
          messageType = 'feedPageSpecific';
          console.log('Should nag: Feed page activity timeout');
        }
      }
      
      // Page hopping behavior
      if (timeSincePageChange < 3000 && timeSinceActivity > 8000) {
        shouldNag = true;
        messageType = 'pageHopping';
        console.log('Should nag: Page hopping detected');
      }
      
      // General procrastination
      if (timeSinceActivity > 20000) { // 20 seconds idle
        shouldNag = true;
        messageType = 'procrastinating';
        console.log('Should nag: General procrastination');
      }

      if (shouldNag && !showMomDialog) {
        console.log('Triggering Mom nag with type:', messageType);
        triggerMomNag(messageType);
      }
    };

    const interval = setInterval(checkForNagging, 3000); // Check every 3 seconds
    return () => clearInterval(interval);
  }, [isMomModeEnabled, lastActivityTime, lastPageChange, lastTypingTime, location.pathname, showMomDialog, isTypingSlow]);

  const triggerMomNag = (type: keyof typeof momMessages) => {
    const messageData = momMessages[type];
    const message = messageData.messages[Math.floor(Math.random() * messageData.messages.length)];

    console.log('Mom is nagging:', message);
    setConversation([{ sender: 'mom', message, mood: messageData.mood }]);
    setCurrentMood(messageData.mood);
    setShowMomDialog(true);
    setIsMinimized(false);
  };

  const handleUserReply = () => {
    if (!userReply.trim()) return;

    const newConversation = [...conversation, { sender: 'user' as const, message: userReply }];
    setConversation(newConversation);

    // Mom's responses based on what user says
    const momResponses = [
      { message: "Nice try, but I'm still your mom and you still need to study!", mood: 'stern' },
      { message: "Excuses, excuses! I've heard them all before.", mood: 'nagging' },
      { message: "That's what your father would say too. Now get to work!", mood: 'stern' },
      { message: "I love you, but loving you means pushing you to succeed!", mood: 'encouraging' },
      { message: "You can sweet talk me all you want, but those grades won't improve themselves!", mood: 'nagging' },
    ];

    setTimeout(() => {
      const response = momResponses[Math.floor(Math.random() * momResponses.length)];
      setConversation(prev => [...prev, { sender: 'mom', message: response.message, mood: response.mood }]);
      setCurrentMood(response.mood as any);
    }, 1000);

    setUserReply('');
  };

  const handleClose = () => {
    console.log('Closing Mom Mode dialog');
    setShowMomDialog(false);
    setConversation([]);
    // Don't unmount the component, just hide the dialog
  };

  if (!showMomDialog) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isMinimized ? 'transform scale-75' : ''}`}>
      <Card className="w-80 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 shadow-lg animate-scale-in">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <AnimatedMomAvatar mood={currentMood} size="md" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Mom Mode</h3>
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="text-xs border-purple-300 text-purple-600">
                    Active
                  </Badge>
                  {typingSpeed > 0 && (
                    <Badge variant="outline" className={`text-xs ${isTypingSlow ? 'border-red-300 text-red-600' : 'border-green-300 text-green-600'}`}>
                      {typingSpeed} CPM
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                onClick={() => setIsMinimized(!isMinimized)}
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
              >
                <MessageCircle className="w-3 h-3" />
              </Button>
              <Button
                onClick={handleClose}
                variant="ghost"
                size="sm"
                className="p-1 h-6 w-6"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                {conversation.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg text-sm transition-all duration-300 ${
                      msg.sender === 'mom'
                        ? 'bg-pink-100 text-pink-800 border-l-4 border-pink-400 animate-fade-in'
                        : 'bg-gray-100 text-gray-800 ml-4'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {msg.sender === 'mom' && (
                        <AnimatedMomAvatar mood={msg.mood as any || currentMood} size="sm" />
                      )}
                      <div>
                        <span className="font-medium">
                          {msg.sender === 'mom' ? 'Mom: ' : 'You: '}
                        </span>
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Reply to mom..."
                  value={userReply}
                  onChange={(e) => setUserReply(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserReply()}
                  className="text-sm border-pink-200 focus:border-pink-400"
                />
                <Button
                  onClick={handleUserReply}
                  size="sm"
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default GlobalMomMode;
