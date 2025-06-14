
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ExternalLink, Plus } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'study' | 'exam' | 'assignment' | 'meeting';
}

const CalendarSection = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // Sample events
  const [events] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Calculus Exam',
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      time: '10:00 AM',
      type: 'exam'
    },
    {
      id: '2',
      title: 'Study Group - Physics',
      date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
      time: '2:00 PM',
      type: 'study'
    },
    {
      id: '3',
      title: 'Chemistry Assignment Due',
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      time: '11:59 PM',
      type: 'assignment'
    },
    {
      id: '4',
      title: 'Professor Meeting',
      date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      time: '3:00 PM',
      type: 'meeting'
    }
  ]);

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

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg">Calendar</CardTitle>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-4 h-4 mr-2" />
            Connect Google Calendar
          </Button>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
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
          
          {selectedDate && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">
                Events for {selectedDate.toLocaleDateString()}
              </h4>
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-sm text-muted-foreground">No events scheduled</p>
              ) : (
                <div className="space-y-2">
                  {getEventsForDate(selectedDate).map(event => (
                    <div key={event.id} className="flex items-center justify-between p-2 border rounded">
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
          <CardTitle className="text-lg">Upcoming Events</CardTitle>
          <Button size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.length === 0 ? (
            <p className="text-muted-foreground text-sm">No upcoming events</p>
          ) : (
            upcomingEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
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

      {/* Future Integration Notice */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center">
            <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <h4 className="font-medium mb-1">Google Calendar Integration</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Sync your study schedule with Google Calendar for better organization
            </p>
            <Button variant="outline" size="sm" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarSection;
