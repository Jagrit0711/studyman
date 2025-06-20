
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';

interface MomModeProps {
  isOnFocusPage: boolean;
  hasStartedSession: boolean;
  isTypingSlow: boolean;
  lastActivityTime: number;
}

const MomMode = ({ isOnFocusPage, hasStartedSession, isTypingSlow, lastActivityTime }: MomModeProps) => {
  const { profileDetails } = useUserProfile();
  const [showMomDialog, setShowMomDialog] = useState(false);
  const [userReply, setUserReply] = useState('');
  const [conversation, setConversation] = useState<{ sender: 'mom' | 'user', message: string }[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  // Check if Mom Mode is enabled
  const isMomModeEnabled = profileDetails?.enable_mom_mode === true;

  const momMessages = {
    idleTooLong: [
      "Start that focus session! You're here for a reason!",
      "The timer is waiting for you to press start!",
      "Focus mode means FOCUS, honey!",
    ],
    typingSlow: [
      "Type faster! Time is ticking!",
      "Your fingers are moving like molasses!",
      "Pick up the pace, sweetheart!",
    ],
    motivationalTips: [
      "Start with one task and finish it!",
      "25 minutes of focus can change your day!",
      "You've got this! Just press start!",
    ]
  };

  useEffect(() => {
    if (!isMomModeEnabled || !isOnFocusPage) return;

    const checkForNagging = () => {
      const timeSinceActivity = Date.now() - lastActivityTime;
      const shouldNagForIdle = !hasStartedSession && timeSinceActivity > 30000; // 30 seconds
      const shouldNagForSlowTyping = hasStartedSession && isTypingSlow;

      if (shouldNagForIdle) {
        triggerMomNag('idleTooLong');
      } else if (shouldNagForSlowTyping) {
        triggerMomNag('typingSlow');
      }
    };

    const interval = setInterval(checkForNagging, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [isMomModeEnabled, isOnFocusPage, hasStartedSession, isTypingSlow, lastActivityTime]);

  const triggerMomNag = (type: 'idleTooLong' | 'typingSlow') => {
    if (showMomDialog) return; // Don't spam if dialog is already open

    let message;
    if (type === 'typingSlow') {
      const tips = momMessages.motivationalTips;
      message = tips[Math.floor(Math.random() * tips.length)];
    } else {
      const messages = momMessages[type];
      message = messages[Math.floor(Math.random() * messages.length)];
    }

    setConversation([{ sender: 'mom', message }]);
    setShowMomDialog(true);
    setIsMinimized(false);
  };

  const handleUserReply = () => {
    if (!userReply.trim()) return;

    const newConversation = [...conversation, { sender: 'user' as const, message: userReply }];
    setConversation(newConversation);

    const momResponses = [
      "Good! Now get back to focusing!",
      "That's my child! Now make me proud!",
      "Alright, but I'm watching you!",
    ];

    setTimeout(() => {
      const response = momResponses[Math.floor(Math.random() * momResponses.length)];
      setConversation(prev => [...prev, { sender: 'mom', message: response }]);
    }, 1000);

    setUserReply('');
  };

  // Don't show focus-specific mom mode if global mom mode is handling everything
  if (!isMomModeEnabled || !showMomDialog || !isOnFocusPage) return null;

  return (
    <div className={`fixed bottom-4 left-4 z-40 transition-all duration-300 ${isMinimized ? 'transform scale-75' : ''}`}>
      <Card className="w-80 bg-gradient-to-br from-green-50 to-blue-50 border-green-200 shadow-lg animate-scale-in">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🎯</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Focus Mom</h3>
                <Badge variant="outline" className="text-xs border-green-300 text-green-600">
                  Focus Mode
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
                        ? 'bg-green-100 text-green-800 border-l-4 border-green-400'
                        : 'bg-gray-100 text-gray-800 ml-4'
                    }`}
                  >
                    <span className="font-medium">
                      {msg.sender === 'mom' ? '🎯 Focus Mom: ' : '👤 You: '}
                    </span>
                    {msg.message}
                  </div>
                ))}
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Reply to Focus Mom..."
                  value={userReply}
                  onChange={(e) => setUserReply(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserReply()}
                  className="text-sm border-green-200 focus:border-green-400"
                />
                <Button
                  onClick={handleUserReply}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
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
