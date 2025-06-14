import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, ExternalLink, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'study' | 'exam' | 'assignment' | 'meeting';
}

interface NewEventForm {
  title: string;
  date: string;
  time: string;
  type: 'study' | 'exam' | 'assignment' | 'meeting';
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
    type: 'study'
  });

  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch calendar events from Supabase
  const fetchEvents = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to load your calendar events",
          variant: "destructive"
        });
        return;
      }

      const mappedEvents: CalendarEvent[] = data.map(event => ({
        id: event.id,
        title: event.title,
        date: new Date(event.date),
        time: event.time,
        type: event.type as 'study' | 'exam' | 'assignment' | 'meeting'
      }));

      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error in fetchEvents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

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

      const newCalendarEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        date: new Date(data.date),
        time: data.time,
        type: data.type as 'study' | 'exam' | 'assignment' | 'meeting'
      };

      setEvents(prev => [...prev, newCalendarEvent]);
      setNewEvent({ title: '', date: '', time: '', type: 'study' });
      setIsAddDialogOpen(false);

      toast({
        title: "Success",
        description: "Event added successfully"
      });
    } catch (error) {
      console.error('Error in handleAddEvent:', error);
    }
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
          <Button variant="outline" size="sm" className="text-sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Connect Google Calendar
          </Button>
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
                  backgroundColor: 'hsl(var(--primary))', 
                  color: 'hsl(var(--primary-foreground))',
                  fontWeight: 'bold'
                }
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
                        <p className="text-xs text-muted-foreground">{event.time}</p>
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

      {/* Google Calendar Integration Notice */}
      <Card className="border-dashed border-2">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <CalendarIcon className="w-8 h-8 mx-auto text-muted-foreground" />
            <div>
              <h4 className="font-medium mb-1">Google Calendar Integration</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Sync your study schedule with Google Calendar for better organization
              </p>
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" disabled className="w-full">
                Coming Soon - Two-way Sync
              </Button>
              <p className="text-xs text-muted-foreground">
                Full Google Calendar integration with automatic sync is under development
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSection;
