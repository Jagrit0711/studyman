
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, Target, Clock } from 'lucide-react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { useFocusSessions } from '@/hooks/useFocusSessions';
import { useRecentActivities } from '@/hooks/useRecentActivities';

interface CalendarSchedulerProps {
  taskTitle: string;
  sessionType: 'work' | 'shortBreak' | 'longBreak';
  duration: number;
}

const CalendarScheduler = ({ taskTitle, sessionType, duration }: CalendarSchedulerProps) => {
  const { isConnected, connectGoogleCalendar, createEvent, events, fetchEvents } = useGoogleCalendar();
  const { startSession } = useFocusSessions();
  const { addActivity } = useRecentActivities();
  
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [eventTitle, setEventTitle] = useState(taskTitle || '');
  const [linkToExisting, setLinkToExisting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState('');

  // Fetch events when dialog opens and when connected
  useEffect(() => {
    if (isConnected && showScheduler) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Get events from last week
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30); // Get events for next month
      fetchEvents(startDate, endDate);
    }
  }, [isConnected, showScheduler, fetchEvents]);

  const getEventTypeFromTitle = (eventTitle: string): string => {
    const lowerTitle = eventTitle.toLowerCase();
    if (lowerTitle.includes('test') || lowerTitle.includes('exam') || lowerTitle.includes('quiz')) {
      return 'exam preparation';
    } else if (lowerTitle.includes('meeting') || lowerTitle.includes('interview')) {
      return 'meeting preparation';
    } else if (lowerTitle.includes('presentation') || lowerTitle.includes('demo')) {
      return 'presentation prep';
    } else if (lowerTitle.includes('assignment') || lowerTitle.includes('project')) {
      return 'assignment work';
    } else if (lowerTitle.includes('class') || lowerTitle.includes('lecture')) {
      return 'study session';
    } else {
      return 'preparation';
    }
  };

  const formatEventDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 *60 * 60));
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = date.toLocaleDateString();
    
    if (diffInHours < 0) {
      return `${dateStr} at ${timeStr} (Past)`;
    } else if (diffInHours < 24) {
      return `Today at ${timeStr}`;
    } else if (diffInHours < 48) {
      return `Tomorrow at ${timeStr}`;
    } else {
      return `${dateStr} at ${timeStr}`;
    }
  };

  // Get all events (past and future) for linking
  const allEvents = events.sort((a, b) => 
    new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime()
  );

  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start.dateTime);
    const now = new Date();
    return eventDate >= now;
  }).slice(0, 3);

  const scheduleNewSession = async () => {
    if (!scheduledDate || !scheduledTime || !eventTitle) return;

    try {
      const startDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const endDateTime = new Date(startDateTime.getTime() + duration * 60 * 1000);

      // Create Google Calendar event
      const calendarEvent = await createEvent({
        summary: `Focus Session: ${eventTitle}`,
        description: `${sessionType} session for ${duration} minutes`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });

      // Create focus session in database
      await startSession({
        session_type: sessionType,
        duration_minutes: duration,
        task_title: eventTitle,
      });

      // Add activity
      await addActivity({
        activity_type: 'focus_session',
        title: `Scheduled Focus Session: ${eventTitle}`,
        description: `Scheduled for ${scheduledDate} at ${scheduledTime}`,
      });

      setShowScheduler(false);
      resetForm();
    } catch (error) {
      console.error('Failed to schedule session:', error);
    }
  };

  const linkToExistingEvent = async () => {
    if (!selectedEvent) return;

    try {
      const event = allEvents.find(e => e.id === selectedEvent);
      if (!event) return;

      const eventDate = new Date(event.start.dateTime);
      const prepTime = new Date(eventDate.getTime() - (duration * 60 * 1000)); // Schedule before the event
      const eventType = getEventTypeFromTitle(event.summary);
      
      // Create a preparation session before the original event
      const prepEvent = await createEvent({
        summary: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} - ${event.summary}`,
        description: `Focus session for ${eventType} (${duration} min prep for: ${event.summary})`,
        start: {
          dateTime: prepTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: eventDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      });

      // Create focus session
      await startSession({
        session_type: sessionType,
        duration_minutes: duration,
        task_title: `${eventType} - ${event.summary}`,
      });

      // Add activity
      await addActivity({
        activity_type: 'focus_session',
        title: `Prep Session Scheduled: ${event.summary}`,
        description: `Created ${eventType} session before ${event.summary}`,
      });

      setShowScheduler(false);
      resetForm();
    } catch (error) {
      console.error('Failed to link to existing event:', error);
    }
  };

  const resetForm = () => {
    setScheduledDate('');
    setScheduledTime('');
    setEventTitle(taskTitle || '');
    setLinkToExisting(false);
    setSelectedEvent('');
  };

  if (!isConnected) {
    return (
      <Card className="p-6 border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
          <Badge variant="outline" className="border-gray-300 text-gray-600">
            Not Connected
          </Badge>
        </div>
        
        <Button 
          onClick={connectGoogleCalendar}
          variant="outline" 
          className="w-full border-gray-300"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Connect Google Calendar
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Schedule</h3>
        <Badge className="bg-blue-100 text-blue-800">Calendar Ready</Badge>
      </div>
      
      <div className="space-y-3">
        <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-gray-300">
              <Target className="w-4 h-4 mr-2" />
              Schedule Focus Session
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule Focus Session</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new-event"
                  checked={!linkToExisting}
                  onChange={() => setLinkToExisting(false)}
                />
                <Label htmlFor="new-event">Create New Event</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="link-existing"
                  checked={linkToExisting}
                  onChange={() => setLinkToExisting(true)}
                />
                <Label htmlFor="link-existing">Link to Existing Event</Label>
              </div>

              {!linkToExisting ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="event-title">Event Title</Label>
                    <Input
                      id="event-title"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      placeholder="Focus session title"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="scheduled-date">Date</Label>
                    <Input
                      id="scheduled-date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="scheduled-time">Time</Label>
                    <Input
                      id="scheduled-time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={scheduleNewSession} className="w-full">
                    Schedule Session
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="existing-event">Choose Event to Prepare For</Label>
                    <select
                      id="existing-event"
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded max-h-32 overflow-y-auto"
                      size={Math.min(allEvents.length + 1, 6)}
                    >
                      <option value="">Select an event</option>
                      {allEvents.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.summary} - {formatEventDateTime(event.start.dateTime)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedEvent && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        This will create a {duration}-minute preparation session before your selected event.
                      </p>
                    </div>
                  )}
                  
                  <Button 
                    onClick={linkToExistingEvent} 
                    className="w-full"
                    disabled={!selectedEvent}
                  >
                    Create Prep Session
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        {upcomingEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Next Events:</h4>
            {upcomingEvents.map((event) => (
              <div key={event.id} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                <p className="font-medium">{event.summary}</p>
                <p className="text-xs text-gray-500">
                  {formatEventDateTime(event.start.dateTime)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CalendarScheduler;
