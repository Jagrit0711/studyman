
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send } from 'lucide-react';
import { useUserSettings } from '@/hooks/useUserSettings';

interface MomModeProps {
  isOnFocusPage: boolean;
  hasStartedSession: boolean;
  isTypingSlow: boolean;
  lastActivityTime: number;
}

const MomMode = ({ isOnFocusPage, hasStartedSession, isTypingSlow, lastActivityTime }: MomModeProps) => {
  const { settings } = useUserSettings();
  const [showMomDialog, setShowMomDialog] = useState(false);
  const [momMessage, setMomMessage] = useState('');
  const [userReply, setUserReply] = useState('');
  const [conversation, setConversation] = useState<{ sender: 'mom' | 'user', message: string }[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Check if Mom Mode is enabled in settings
  const isMomModeEnabled = settings?.privacy_mode === false; // Using privacy_mode as a placeholder

  const momMessages = {
    idleTooLong: [
      "Are you going to start working or just sit there like your dad?",
      "I didn't raise you to stare at screens doing nothing!",
      "Your homework isn't going to do itself, honey.",
      "Stop procrastinating! I know what you're doing.",
    ],
    typingSlow: [
      "Why are you typing so slow? Get moving!",
      "At this rate, you'll graduate when I'm 90!",
      "Type faster! I've seen turtles move quicker than this.",
      "Are you typing with your elbows? Speed it up!",
    ],
    motivationalTips: [
      "Start with one sentence, don't overthink!",
      "Break it into smaller chunks, sweetheart.",
      "Remember: done is better than perfect.",
      "You've got this! Just like when you learned to ride a bike.",
    ]
  };

  useEffect(() => {
    if (!isMomModeEnabled || !isOnFocusPage) return;

    const checkForNagging = () => {
      const timeSinceActivity = Date.now() - lastActivityTime;
      const shouldNagForIdle = !hasStartedSession && timeSinceActivity > 30000; // 30 seconds
      const shouldNagForSlowTyping = isTypingSlow;

      if (shouldNagForIdle) {
        triggerMomNag('idleTooLong');
      } else if (shouldNagForSlowTyping) {
        triggerMomNag('typingSlow');
      }
    };

    const interval = setInterval(checkForNagging, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [isMomModeEnabled, isOnFocusPage, hasStartedSession, isTypingSlow, lastActivityTime]);

  const triggerMomNag = async (type: 'idleTooLong' | 'typingSlow') => {
    if (showMomDialog) return; // Don't spam if dialog is already open

    let message;
    if (type === 'typingSlow') {
      // Show motivational tip for slow typing
      const tips = momMessages.motivationalTips;
      message = tips[Math.floor(Math.random() * tips.length)];
    } else {
      const messages = momMessages[type];
      message = messages[Math.floor(Math.random() * messages.length)];
    }

    // In a real implementation, you'd call the Gemini API here
    // For now, we'll use predefined messages
    setMomMessage(message);
    setConversation([{ sender: 'mom', message }]);
    setShowMomDialog(true);
    setIsMinimized(false);
  };

  const handleUserReply = async () => {
    if (!userReply.trim()) return;

    const newConversation = [...conversation, { sender: 'user' as const, message: userReply }];
    setConversation(newConversation);

    // Simulate mom's response (in real implementation, call Gemini API)
    const momResponses = [
      "Well, at least you're talking back! Now get to work!",
      "Excuses, excuses! I've heard them all before.",
      "Nice try, but I'm still your mom and you still have work to do.",
      "That's what your father would say too. Now focus!",
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
                  Beta
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

export default MomMode;
