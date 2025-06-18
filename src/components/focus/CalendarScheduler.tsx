
import { useState } from 'react';
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

  // Get today's and tomorrow's events
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const upcomingEvents = events.filter(event => {
    const eventDate = new Date(event.start.dateTime);
    return eventDate >= today;
  }).slice(0, 5);

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
      const event = events.find(e => e.id === selectedEvent);
      if (!event) return;

      // Update the existing event to include focus session info
      await createEvent({
        summary: `${event.summary} (Focus Session)`,
        description: `${event.description || ''}\n\nFocus Session: ${sessionType} for ${duration} minutes`,
        start: event.start,
        end: event.end,
      });

      // Create focus session
      await startSession({
        session_type: sessionType,
        duration_minutes: duration,
        task_title: event.summary,
      });

      // Add activity
      await addActivity({
        activity_type: 'focus_session',
        title: `Linked Focus Session to: ${event.summary}`,
        description: `Linked ${sessionType} session to existing calendar event`,
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

  const formatEventTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffInHours = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `in ${diffInHours}h`;
    } else {
      return date.toLocaleDateString();
    }
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
        <Badge className="bg-green-100 text-green-800">Connected</Badge>
      </div>
      
      <div className="space-y-3">
        <Dialog open={showScheduler} onOpenChange={setShowScheduler}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-gray-300">
              <Target className="w-4 h-4 mr-2" />
              Schedule Focus Session
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white max-w-md">
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
                    <Label htmlFor="existing-event">Choose Event</Label>
                    <select
                      id="existing-event"
                      value={selectedEvent}
                      onChange={(e) => setSelectedEvent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    >
                      <option value="">Select an event</option>
                      {upcomingEvents.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.summary} - {formatEventTime(event.start.dateTime)}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button onClick={linkToExistingEvent} className="w-full">
                    Link to Event
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        {upcomingEvents.length > 0 && (
          <div className="text-sm text-gray-600">
            <p className="font-medium">Next: {upcomingEvents[0].summary}</p>
            <p className="text-xs text-gray-500">
              {formatEventTime(upcomingEvents[0].start.dateTime)}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CalendarScheduler;
