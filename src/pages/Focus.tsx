
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, SkipForward, Volume2, Calendar, Clock, Target, Maximize, Settings } from 'lucide-react';
import Header from '@/components/Header';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { ComingSoonModal } from '@/components/ui/coming-soon-modal';

const Focus = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState('No track selected');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('work'); // work, shortBreak, longBreak
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [showSpotifyModal, setShowSpotifyModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  
  const { isConnected, connectGoogleCalendar } = useGoogleCalendar();

  const sessionTypes = {
    work: { duration: 25 * 60, label: 'Focus Session', color: 'bg-red-500' },
    shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'bg-green-500' },
    longBreak: { duration: 15 * 60, label: 'Long Break', color: 'bg-blue-500' }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Auto-switch session type
      if (sessionType === 'work') {
        setSessionType('shortBreak');
        setTimeLeft(sessionTypes.shortBreak.duration);
      } else {
        setSessionType('work');
        setTimeLeft(sessionTypes.work.duration);
      }
    }
    return () => {
      if (interval) clearTimeout(interval);
    };
  }, [isActive, timeLeft, sessionType]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(sessionTypes[sessionType as keyof typeof sessionTypes].duration);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const backgroundGradients = {
    work: 'bg-gradient-to-br from-red-50 to-orange-50',
    shortBreak: 'bg-gradient-to-br from-green-50 to-emerald-50',
    longBreak: 'bg-gradient-to-br from-blue-50 to-indigo-50'
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${backgroundGradients[sessionType as keyof typeof backgroundGradients]}`}>
      {!isFullscreen && <Header />}
      
      <div className="container mx-auto px-4 py-8">
        {!isFullscreen && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Focus Mode</h1>
              <p className="text-gray-600">Stay focused with Pomodoro technique, music, and task tracking</p>
            </div>
            <Button onClick={toggleFullscreen} variant="outline" className="border-gray-300">
              <Maximize className="w-4 h-4 mr-2" />
              Fullscreen
            </Button>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timer Section */}
            <div className="lg:col-span-2">
              <Card className="p-8 text-center border-gray-200 shadow-lg">
                <div className="mb-6">
                  <Badge 
                    className={`${sessionTypes[sessionType as keyof typeof sessionTypes].color} text-white text-sm px-4 py-1`}
                  >
                    {sessionTypes[sessionType as keyof typeof sessionTypes].label}
                  </Badge>
                </div>
                
                <div className="mb-8">
                  <div className={`text-8xl font-mono font-bold mb-4 ${
                    sessionType === 'work' ? 'text-red-600' : 
                    sessionType === 'shortBreak' ? 'text-green-600' : 'text-blue-600'
                  }`}>
                    {formatTime(timeLeft)}
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={toggleTimer}
                      size="lg"
                      className={`${sessionTypes[sessionType as keyof typeof sessionTypes].color} hover:opacity-90 text-white px-8 py-3`}
                    >
                      {isActive ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                      {isActive ? 'Pause' : 'Start'}
                    </Button>
                    <Button onClick={resetTimer} variant="outline" size="lg" className="border-gray-300 px-8 py-3">
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Session Type Selector */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {Object.entries(sessionTypes).map(([key, type]) => (
                    <Button
                      key={key}
                      variant={sessionType === key ? 'default' : 'outline'}
                      onClick={() => {
                        setSessionType(key);
                        setTimeLeft(type.duration);
                        setIsActive(false);
                      }}
                      className={sessionType === key ? `${type.color} text-white` : 'border-gray-300'}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>

                {/* Current Task */}
                <div className="mb-6">
                  <Input
                    placeholder="What are you working on?"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="text-center text-lg border-gray-300 focus:border-gray-500"
                  />
                </div>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Music Control */}
              <Card className="p-6 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Music</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowSpotifyModal(true)}
                    className="border-gray-300"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-900">{currentTrack}</p>
                    <p className="text-xs text-gray-500">Spotify</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => setIsPlaying(!isPlaying)}
                      variant="outline"
                      size="sm"
                      className="border-gray-300"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300">
                      <SkipForward className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-gray-300">
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Calendar Integration */}
              <Card className="p-6 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
                  <Badge variant={isConnected ? "default" : "outline"} className={isConnected ? "bg-green-100 text-green-800" : "border-gray-300"}>
                    {isConnected ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
                
                {!isConnected ? (
                  <Button 
                    onClick={connectGoogleCalendar}
                    variant="outline" 
                    className="w-full border-gray-300"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Connect Google Calendar
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setShowCalendarModal(true)}
                      variant="outline" 
                      className="w-full border-gray-300"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Schedule Focus Session
                    </Button>
                    
                    <div className="text-sm text-gray-600">
                      <p>Next: Team Meeting</p>
                      <p className="text-xs text-gray-500">in 2 hours</p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Stats */}
              <Card className="p-6 border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Focus Sessions</span>
                    <span className="text-sm font-medium text-gray-900">4/8</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Study Time</span>
                    <span className="text-sm font-medium text-gray-900">2h 15m</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Breaks Taken</span>
                    <span className="text-sm font-medium text-gray-900">3</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ComingSoonModal
        isOpen={showSpotifyModal}
        onClose={() => setShowSpotifyModal(false)}
        feature="Spotify Integration"
      />
      
      <ComingSoonModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        feature="Calendar Scheduling"
      />
    </div>
  );
};

export default Focus;
