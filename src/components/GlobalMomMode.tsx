
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
import { supabase } from '@/integrations/supabase/client';

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
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  // Check if Mom Mode is enabled
  const isMomModeEnabled = settings?.enable_mom_mode === true;

  console.log('GlobalMomMode render:', { 
    isMomModeEnabled, 
    settings,
    loading,
    user: !!user,
    currentPath: location.pathname,
    typingSpeed,
    isTypingSlow,
    showMomDialog
  });

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

  // Generate AI response using Gemini
  const generateMomResponse = async (context: string, userMessage?: string, mood: string = 'stern') => {
    try {
      setIsGeneratingResponse(true);
      console.log('Generating AI response with context:', context);
      
      const { data, error } = await supabase.functions.invoke('mom-mode-chat', {
        body: { context, userMessage, mood }
      });

      if (error) throw error;
      
      console.log('AI response:', data);
      return data.message;
    } catch (error) {
      console.error('Error generating AI response:', error);
      // Fallback to basic messages if AI fails
      const fallbacks = [
        "Hey! Focus up and get back to work!",
        "I'm watching you - no more distractions!",
        "Come on, you can do better than this!",
        "Time to buckle down and study!"
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  // Mom's nagging logic with better detection
  useEffect(() => {
    if (!isMomModeEnabled) return;

    console.log('Setting up Mom nagging interval for path:', location.pathname);

    const checkForNagging = async () => {
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
      let context = '';
      let mood: 'happy' | 'stern' | 'encouraging' | 'nagging' | 'proud' = 'stern';

      // Dashboard-specific nagging (more aggressive)
      if (location.pathname === '/dashboard') {
        if (timeSinceActivity > 8000) { // 8 seconds idle on dashboard
          shouldNag = true;
          context = 'User has been idle on the dashboard for 8+ seconds. They should pick a study activity instead of just staring at their stats.';
          mood = 'nagging';
          console.log('Should nag: Dashboard idle timeout');
        }
      }

      // Feed page - nag immediately 
      if (location.pathname === '/feed') {
        if (timeSinceActivity > 5000) { // 5 seconds on feed
          shouldNag = true;
          context = 'User is on the social feed instead of studying. They need to close this and get back to work.';
          mood = 'stern';
          console.log('Should nag: Feed page detected');
        }
      }

      // Slow typing detection (when user is typing but slowly)
      if (isTypingSlow && timeSinceTyping < 3000) {
        shouldNag = true;
        context = `User is typing very slowly at ${typingSpeed} characters per minute. They need to focus and type faster.`;
        mood = 'nagging';
        console.log('Should nag: Slow typing detected');
      }
      
      // Page hopping behavior (jumping between pages quickly)
      if (timeSincePageChange < 4000 && timeSinceActivity > 6000) {
        shouldNag = true;
        context = 'User is rapidly switching between pages without settling down to study. They need to pick one thing and focus.';
        mood = 'stern';
        console.log('Should nag: Page hopping detected');
      }
      
      // General procrastination (longer idle time)
      if (timeSinceActivity > 15000) { // 15 seconds idle
        shouldNag = true;
        context = `User has been completely idle for ${Math.round(timeSinceActivity/1000)} seconds. Time to get moving and be productive.`;
        mood = 'encouraging';
        console.log('Should nag: General procrastination');
      }

      if (shouldNag && !showMomDialog && !isGeneratingResponse) {
        console.log('Triggering Mom nag with context:', context);
        await triggerMomNag(context, mood);
      }
    };

    const interval = setInterval(checkForNagging, 2000); // Check every 2 seconds for better responsiveness
    return () => clearInterval(interval);
  }, [isMomModeEnabled, lastActivityTime, lastPageChange, lastTypingTime, location.pathname, showMomDialog, isTypingSlow, isGeneratingResponse]);

  const triggerMomNag = async (context: string, mood: 'happy' | 'stern' | 'encouraging' | 'nagging' | 'proud') => {
    console.log('Mom is generating a response...');
    const message = await generateMomResponse(context, undefined, mood);
    
    console.log('Mom says:', message);
    setConversation([{ sender: 'mom', message, mood }]);
    setCurrentMood(mood);
    setShowMomDialog(true);
    setIsMinimized(false);
  };

  const handleUserReply = async () => {
    if (!userReply.trim() || isGeneratingResponse) return;

    const newConversation = [...conversation, { sender: 'user' as const, message: userReply }];
    setConversation(newConversation);

    // Generate AI response to user's reply
    const context = `User replied: "${userReply}". Respond as a mom who's trying to get them back to studying.`;
    const response = await generateMomResponse(context, userReply, currentMood);

    setTimeout(() => {
      setConversation(prev => [...prev, { sender: 'mom', message: response, mood: currentMood }]);
    }, 1000);

    setUserReply('');
  };

  const handleClose = () => {
    console.log('Closing Mom Mode dialog');
    setShowMomDialog(false);
    setConversation([]);
  };

  // Early return checks AFTER all hooks
  if (!user) {
    console.log('GlobalMomMode: User not authenticated, not showing Mom Mode');
    return null;
  }

  const excludedPaths = ['/', '/login', '/signup', '/onboarding'];
  if (excludedPaths.includes(location.pathname)) {
    console.log('GlobalMomMode: On excluded path, not showing Mom Mode:', location.pathname);
    return null;
  }

  if (loading) {
    console.log('GlobalMomMode: Still loading settings');
    return null;
  }

  if (!isMomModeEnabled) {
    console.log('GlobalMomMode: Mom Mode not enabled');
    return null;
  }

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
                <h3 className="text-sm font-semibold text-gray-900">AI Mom Mode</h3>
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="text-xs border-purple-300 text-purple-600">
                    {isGeneratingResponse ? 'Thinking...' : 'Active'}
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
                {isGeneratingResponse && (
                  <div className="p-2 rounded-lg text-sm bg-pink-100 text-pink-800 border-l-4 border-pink-400 animate-pulse">
                    <div className="flex items-center space-x-2">
                      <AnimatedMomAvatar mood={currentMood} size="sm" />
                      <div>
                        <span className="font-medium">Mom: </span>
                        <span className="italic">Thinking of what to say...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Reply to mom..."
                  value={userReply}
                  onChange={(e) => setUserReply(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserReply()}
                  className="text-sm border-pink-200 focus:border-pink-400"
                  disabled={isGeneratingResponse}
                />
                <Button
                  onClick={handleUserReply}
                  size="sm"
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                  disabled={isGeneratingResponse}
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
