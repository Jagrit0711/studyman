
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useLocation } from 'react-router-dom';

const GlobalMomMode = () => {
  const { profileDetails } = useUserProfile();
  const location = useLocation();
  const [showMomDialog, setShowMomDialog] = useState(false);
  const [userReply, setUserReply] = useState('');
  const [conversation, setConversation] = useState<{ sender: 'mom' | 'user', message: string }[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());
  const [lastPageChange, setLastPageChange] = useState(Date.now());

  // Check if Mom Mode is enabled
  const isMomModeEnabled = profileDetails?.enable_mom_mode === true;

  console.log('GlobalMomMode render:', { 
    isMomModeEnabled, 
    profileDetails: profileDetails?.enable_mom_mode,
    currentPath: location.pathname
  });

  const momMessages = {
    procrastinating: [
      "Hey! Stop scrolling and get back to studying!",
      "I didn't raise you to waste time on social media!",
      "Your future self will thank you for studying now instead of procrastinating!",
      "Close that chat and open your books, young one!",
      "You think success comes from chatting? GET TO WORK!",
    ],
    pageHopping: [
      "Stop jumping between pages and focus on one thing!",
      "You're like a butterfly - land somewhere and STUDY!",
      "Pick a page and stick with it, honey!",
      "All this clicking around won't help your grades!",
    ],
    motivational: [
      "I know you can do better than this, sweetheart.",
      "Remember why you started - now finish what you began!",
      "Success is just one focused session away!",
      "Your future career is waiting for you to get serious!",
    ],
    feedPageSpecific: [
      "Why are you chatting when you should be studying?!",
      "These posts won't help you pass your exams!",
      "Stop gossiping and start focusing on your future!",
      "Real talk: your grades matter more than this feed!",
    ]
  };

  // Track user activity
  useEffect(() => {
    const updateActivity = () => setLastActivityTime(Date.now());
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, []);

  // Track page changes
  useEffect(() => {
    setLastPageChange(Date.now());
  }, [location.pathname]);

  // Mom's nagging logic
  useEffect(() => {
    if (!isMomModeEnabled) return;

    const checkForNagging = () => {
      const timeSinceActivity = Date.now() - lastActivityTime;
      const timeSincePageChange = Date.now() - lastPageChange;
      
      // Different triggers based on page and behavior
      let shouldNag = false;
      let messageType: keyof typeof momMessages = 'procrastinating';

      // On feed page - nag more aggressively
      if (location.pathname === '/feed' || location.pathname === '/dashboard') {
        if (timeSinceActivity > 20000) { // 20 seconds of being on feed
          shouldNag = true;
          messageType = 'feedPageSpecific';
        }
      }
      
      // Page hopping behavior
      if (timeSincePageChange < 5000 && timeSinceActivity > 15000) {
        shouldNag = true;
        messageType = 'pageHopping';
      }
      
      // General procrastination
      if (timeSinceActivity > 45000) { // 45 seconds idle
        shouldNag = true;
        messageType = 'procrastinating';
      }

      if (shouldNag && !showMomDialog) {
        triggerMomNag(messageType);
      }
    };

    const interval = setInterval(checkForNagging, 8000); // Check every 8 seconds
    return () => clearInterval(interval);
  }, [isMomModeEnabled, lastActivityTime, lastPageChange, location.pathname, showMomDialog]);

  const triggerMomNag = (type: keyof typeof momMessages) => {
    const messages = momMessages[type];
    const message = messages[Math.floor(Math.random() * messages.length)];

    console.log('Mom is nagging:', message);
    setConversation([{ sender: 'mom', message }]);
    setShowMomDialog(true);
    setIsMinimized(false);
  };

  const handleUserReply = () => {
    if (!userReply.trim()) return;

    const newConversation = [...conversation, { sender: 'user' as const, message: userReply }];
    setConversation(newConversation);

    // Mom's responses based on what user says
    const momResponses = [
      "Nice try, but I'm still your mom and you still need to study!",
      "Excuses, excuses! I've heard them all before.",
      "That's what your father would say too. Now get to work!",
      "I love you, but loving you means pushing you to succeed!",
      "You can sweet talk me all you want, but those grades won't improve themselves!",
    ];

    setTimeout(() => {
      const response = momResponses[Math.floor(Math.random() * momResponses.length)];
      setConversation(prev => [...prev, { sender: 'mom', message: response }]);
    }, 1000);

    setUserReply('');
  };

  if (!isMomModeEnabled || !showMomDialog) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${isMinimized ? 'transform scale-75' : ''}`}>
      <Card className="w-80 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 shadow-lg animate-scale-in">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">👩</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Mom Mode</h3>
                <Badge variant="outline" className="text-xs border-purple-300 text-purple-600">
                  Active
                </Badge>
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
                onClick={() => setShowMomDialog(false)}
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
                    className={`p-2 rounded-lg text-sm ${
                      msg.sender === 'mom'
                        ? 'bg-pink-100 text-pink-800 border-l-4 border-pink-400'
                        : 'bg-gray-100 text-gray-800 ml-4'
                    }`}
                  >
                    <span className="font-medium">
                      {msg.sender === 'mom' ? '👩 Mom: ' : '👤 You: '}
                    </span>
                    {msg.message}
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
