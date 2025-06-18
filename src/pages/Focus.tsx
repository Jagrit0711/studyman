
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Maximize } from 'lucide-react';
import Header from '@/components/Header';
import SpotifyPlayer from '@/components/focus/SpotifyPlayer';
import CalendarScheduler from '@/components/focus/CalendarScheduler';
import { useFocusSessions } from '@/hooks/useFocusSessions';

const Focus = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  
  const { activeSession, startSession, completeSession, sessions } = useFocusSessions();

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
      handleSessionComplete();
    }
    return () => {
      if (interval) clearTimeout(interval);
    };
  }, [isActive, timeLeft, sessionType]);

  const handleSessionComplete = async () => {
    setIsActive(false);
    
    // Complete the active session in database if it exists
    if (activeSession) {
      await completeSession(activeSession.id);
    }
    
    // Auto-switch session type
    if (sessionType === 'work') {
      setSessionType('shortBreak');
      setTimeLeft(sessionTypes.shortBreak.duration);
    } else {
      setSessionType('work');
      setTimeLeft(sessionTypes.work.duration);
    }
  };

  const toggleTimer = async () => {
    if (!isActive && !activeSession) {
      // Starting a new session
      const newSession = await startSession({
        session_type: sessionType,
        duration_minutes: sessionTypes[sessionType].duration / 60,
        task_title: taskTitle || undefined
      });
      
      if (newSession) {
        setIsActive(true);
      }
    } else {
      // Just toggle the timer (pause/resume)
      setIsActive(!isActive);
    }
  };

  const resetTimer = async () => {
    setIsActive(false);
    setTimeLeft(sessionTypes[sessionType].duration);
    
    // If there's an active session, complete it
    if (activeSession) {
      await completeSession(activeSession.id);
    }
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

  // Calculate today's stats from sessions
  const todaysSessions = sessions.filter(session => {
    const today = new Date().toDateString();
    const sessionDate = new Date(session.created_at).toDateString();
    return sessionDate === today;
  });

  const completedSessions = todaysSessions.filter(session => session.completed_at);
  const todaysStudyTime = completedSessions
    .filter(session => session.session_type === 'work')
    .reduce((total, session) => total + session.duration_minutes, 0);

  const todaysBreaks = completedSessions.filter(session => 
    session.session_type === 'shortBreak' || session.session_type === 'longBreak'
  ).length;

  return (
    <div className={`min-h-screen transition-all duration-500 ${backgroundGradients[sessionType]}`}>
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
                    className={`${sessionTypes[sessionType].color} text-white text-sm px-4 py-1`}
                  >
                    {sessionTypes[sessionType].label}
                    {activeSession && ' (Active)'}
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
                      className={`${sessionTypes[sessionType].color} hover:opacity-90 text-white px-8 py-3`}
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
                        if (!isActive && !activeSession) {
                          setSessionType(key as 'work' | 'shortBreak' | 'longBreak');
                          setTimeLeft(type.duration);
                        }
                      }}
                      disabled={isActive || !!activeSession}
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
                    disabled={isActive || !!activeSession}
                    className="text-center text-lg border-gray-300 focus:border-gray-500"
                  />
                </div>
              </Card>
            </div>

            {/* Side Panel */}
            <div className="space-y-6">
              {/* Spotify Music Player */}
              <SpotifyPlayer />

              {/* Calendar Integration */}
              <CalendarScheduler 
                taskTitle={taskTitle} 
                sessionType={sessionType} 
                duration={sessionTypes[sessionType].duration / 60} 
              />

              {/* Stats */}
              <Card className="p-6 border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Focus Sessions</span>
                    <span className="text-sm font-medium text-gray-900">{completedSessions.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Study Time</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.floor(todaysStudyTime / 60)}h {todaysStudyTime % 60}m
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Breaks Taken</span>
                    <span className="text-sm font-medium text-gray-900">{todaysBreaks}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Focus;
