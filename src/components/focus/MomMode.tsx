import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';

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
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);

  // Check if Mom Mode is enabled
  const isMomModeEnabled = profileDetails?.enable_mom_mode === true;

  // Generate AI response using Gemini (same as GlobalMomMode)
  const generateMomResponse = async (context: string, userMessage?: string, mood: string = 'stern') => {
    try {
      setIsGeneratingResponse(true);
      const { data, error } = await supabase.functions.invoke('mom-mode-chat', {
        body: { context, userMessage, mood }
      });
      if (error) throw error;
      return data.message;
    } catch (error) {
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

  useEffect(() => {
    if (!isMomModeEnabled || !isOnFocusPage) return;

    const checkForNagging = async () => {
      const timeSinceActivity = Date.now() - lastActivityTime;
      const shouldNagForIdle = !hasStartedSession && timeSinceActivity > 30000; // 30 seconds
      const shouldNagForSlowTyping = hasStartedSession && isTypingSlow;

      let context = '';
      let mood: 'stern' | 'nagging' | 'encouraging' = 'stern';
      if (shouldNagForIdle) {
        context = 'User has been idle on the focus page for 30+ seconds. They should start a focus session.';
        mood = 'nagging';
      } else if (shouldNagForSlowTyping) {
        context = 'User is typing very slowly during a focus session. Encourage them to focus and type faster.';
        mood = 'encouraging';
      } else {
        return;
      }
      if (!showMomDialog && !isGeneratingResponse) {
        await triggerMomNag(context, mood);
      }
    };

    const interval = setInterval(checkForNagging, 15000); // Check every 15 seconds
    return () => clearInterval(interval);
  }, [isMomModeEnabled, isOnFocusPage, hasStartedSession, isTypingSlow, lastActivityTime, showMomDialog, isGeneratingResponse]);

  const triggerMomNag = async (context: string, mood: 'stern' | 'nagging' | 'encouraging') => {
    const message = await generateMomResponse(context, undefined, mood);
    setConversation([{ sender: 'mom', message }]);
    setShowMomDialog(true);
    setIsMinimized(false);
  };

  const handleUserReply = async () => {
    if (!userReply.trim() || isGeneratingResponse) return;
    const newConversation = [...conversation, { sender: 'user' as const, message: userReply }];
    setConversation(newConversation);
    // Generate AI response to user's reply
    const context = `User replied: "${userReply}". Respond as a mom who's trying to get them back to studying.`;
    const response = await generateMomResponse(context, userReply, 'stern');
    setTimeout(() => {
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
                  {isGeneratingResponse ? 'Thinking...' : 'Focus Mode'}
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
                {isGeneratingResponse && (
                  <div className="p-2 rounded-lg text-sm bg-green-100 text-green-800 border-l-4 border-green-400 animate-pulse">
                    <span className="font-medium">🎯 Focus Mom: </span>
                    <span className="italic">Thinking of what to say...</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Input
                  placeholder="Reply to Focus Mom..."
                  value={userReply}
                  onChange={(e) => setUserReply(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserReply()}
                  className="text-sm border-green-200 focus:border-green-400"
                  disabled={isGeneratingResponse}
                />
                <Button
                  onClick={handleUserReply}
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white"
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

export default MomMode;
