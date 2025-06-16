import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, ExternalLink, Plus, Link, Unlink, RefreshCw } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'study' | 'exam' | 'assignment' | 'meeting';
  source?: 'local' | 'google';
}

interface NewEventForm {
  title: string;
  date: string;
  time: string;
  type: 'study' | 'exam' | 'assignment' | 'meeting';
  syncToGoogle: boolean;
}

const CalendarSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<NewEventForm>({
    title: '',
    date: '',
    time: '',
    type: 'study',
    syncToGoogle: false
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isConnected: isGoogleCalendarConnected,
    isLoading: isGoogleCalendarLoading,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    syncEventToGoogleCalendar,
    fetchEvents: fetchGoogleEvents,
    events: googleEvents,
  } = useGoogleCalendar();

  // Fetch calendar events from Supabase
  const fetchLocalEvents = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching local events:', error);
        toast({
          title: "Error",
          description: "Failed to load your calendar events",
          variant: "destructive"
        });
        return [];
      }

      const mappedEvents: CalendarEvent[] = data.map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.date),
        time: event.time,
        type: event.type as 'study' | 'exam' | 'assignment' | 'meeting',
        source: 'local'
      }));

      return mappedEvents;
    } catch (error) {
      console.error('Error in fetchLocalEvents:', error);
      return [];
    }
  };

  // Fetch Google Calendar events with proper type mapping
  const fetchGoogleCalendarEvents = async () => {
    if (!isGoogleCalendarConnected) return [];

    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1); // Fetch events from last month
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2); // Fetch events up to 2 months ahead

      const googleEventsData = await fetchGoogleEvents(startDate, endDate);
      
      // Convert Google events to our format with proper type mapping
      const mappedGoogleEvents: CalendarEvent[] = (googleEventsData || []).map(event => ({
        id: `google_${event.id}`,
        title: event.summary,
        date: new Date(event.start.dateTime),
        time: new Date(event.start.dateTime).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        type: event.eventType || 'meeting', // Use the determined event type
        source: 'google'
      }));

      return mappedGoogleEvents;
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      return [];
    }
  };

  // Combined fetch function
  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      const [localEvents, googleEvents] = await Promise.all([
        fetchLocalEvents(),
        fetchGoogleCalendarEvents()
      ]);

      const allEvents = [...(localEvents || []), ...(googleEvents || [])];
      console.log('All events fetched:', allEvents);
      setEvents(allEvents);
    } catch (error) {
      console.error('Error fetching all events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEvents();
  }, [user, isGoogleCalendarConnected]);

  // Refetch when Google events change
  useEffect(() => {
    if (isGoogleCalendarConnected && googleEvents.length > 0) {
      fetchAllEvents();
    }
  }, [googleEvents]);

  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !newEvent.date || !newEvent.time || !user) return;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          user_id: user.id,
          title: newEvent.title,
          date: newEvent.date,
          time: newEvent.time,
          type: newEvent.type
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding event:', error);
        toast({
          title: "Error",
          description: "Failed to add event",
          variant: "destructive"
        });
        return;
      }

      // Sync to Google Calendar if requested and connected
      if (newEvent.syncToGoogle && isGoogleCalendarConnected) {
        try {
          await syncEventToGoogleCalendar(
            newEvent.title,
            newEvent.date,
            newEvent.time,
            newEvent.type
          );
          console.log('Event synced to Google Calendar successfully');
        } catch (error) {
          console.error('Failed to sync to Google Calendar:', error);
          toast({
            title: "Warning",
            description: "Event created but failed to sync to Google Calendar",
            variant: "destructive"
          });
        }
      }

      // Refresh events to include the new one
      await fetchAllEvents();

      setNewEvent({ title: '', date: '', time: '', type: 'study', syncToGoogle: false });
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Event added successfully"
      });
    } catch (error) {
      console.error('Error in handleAddEvent:', error);
    }
  };

  const handleRefreshEvents = () => {
    fetchAllEvents();
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'exam':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'study':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'assignment':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'meeting':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getDatesWithEvents = () => {
    return events.map(event => event.date);
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const upcomingEvents = events
    .filter(event => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 4);

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to view your calendar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Calendar</CardTitle>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefreshEvents}
              disabled={loading}
              className="text-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {isGoogleCalendarConnected ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={disconnectGoogleCalendar}
                className="text-sm"
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect Google
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={connectGoogleCalendar}
                disabled={isGoogleCalendarLoading}
                className="text-sm"
              >
                <Link className="w-4 h-4 mr-2" />
                {isGoogleCalendarLoading ? 'Connecting...' : 'Connect Google Calendar'}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="w-full"
              modifiers={{
                hasEvents: getDatesWithEvents()
              }}
              modifiersStyles={{
                hasEvents: { 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue background
                  border: '2px solid rgb(59, 130, 246)', // Blue border
                  borderRadius: '6px',
                  fontWeight: 'bold'
                }
              }}
              modifiersClassNames={{
                hasEvents: 'relative after:content-["•"] after:absolute after:bottom-1 after:left-1/2 after:transform after:-translate-x-1/2 after:text-blue-600 after:text-xs'
              }}
            />
          </div>
          
          {selectedDate && (
            <div className="p-4 border-t bg-muted/20">
              <h4 className="font-medium mb-3 text-sm">
                Events for {selectedDate.toLocaleDateString()}
              </h4>
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-muted-foreground">No events scheduled</p>
              ) : (
                <div className="space-y-2">
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
                      <div>
                        <p className="font-medium text-sm">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {event.time} {event.source === 'google' && '(Google Calendar)'}
                        </p>
                      </div>
                      <Badge variant="secondary" className={getEventTypeColor(event.type)}>
                        {event.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-semibold">Upcoming Events</CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="event-title">Title</Label>
                  <Input
                    id="event-title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="event-date">Date</Label>
                  <Input
                    id="event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="event-time">Time</Label>
                  <Input
                    id="event-time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="event-type">Type</Label>
                  <Select value={newEvent.type} onValueChange={(value: 'study' | 'exam' | 'assignment' | 'meeting') => 
                    setNewEvent(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="study">Study</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isGoogleCalendarConnected && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="sync-google"
                      checked={newEvent.syncToGoogle}
                      onCheckedChange={(checked) => setNewEvent(prev => ({ ...prev, syncToGoogle: checked }))}
                    />
                    <Label htmlFor="sync-google" className="text-sm">
                      Sync to Google Calendar
                    </Label>
                  </div>
                )}
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleAddEvent} className="flex-1">
                    Add Event
                  </Button>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading events...</p>
          ) : upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming events</p>
          ) : (
            upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.date.toLocaleDateString()} at {event.time} 
                      {event.source === 'google' && ' (Google Calendar)'}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className={getEventTypeColor(event.type)}>
                  {event.type}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Google Calendar Integration Status */}
      <Card className={isGoogleCalendarConnected ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-dashed border-2"}>
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <CalendarIcon className={`w-8 h-8 mx-auto ${isGoogleCalendarConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
            <div>
              <h4 className="font-medium mb-1">
                {isGoogleCalendarConnected ? 'Google Calendar Connected' : 'Google Calendar Integration'}
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                {isGoogleCalendarConnected 
                  ? 'Your events are now synced with Google Calendar'
                  : 'Connect your Google Calendar to sync study events automatically'
                }
              </p>
            </div>
            {!isGoogleCalendarConnected && (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={connectGoogleCalendar}
                  disabled={isGoogleCalendarLoading}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {isGoogleCalendarLoading ? 'Connecting...' : 'Connect Google Calendar'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Secure OAuth 2.0 authentication with Google
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSection;
