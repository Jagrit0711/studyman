
import { useState, useEffect } from 'react';
import { googleCalendarService } from '@/services/googleCalendar';
import { useToast } from '@/hooks/use-toast';

interface GoogleCalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
}

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const initializeGoogleCalendar = async () => {
      try {
        await googleCalendarService.initialize();
        setIsConnected(googleCalendarService.isSignedIn());
      } catch (error) {
        console.error('Failed to initialize Google Calendar:', error);
      }
    };

    initializeGoogleCalendar();
  }, []);

  const connectGoogleCalendar = async () => {
    setIsLoading(true);
    try {
      await googleCalendarService.requestAccessToken();
      setIsConnected(true);
      toast({
        title: "Success",
        description: "Google Calendar connected successfully"
      });
    } catch (error) {
      console.error('Failed to connect Google Calendar:', error);
      toast({
        title: "Error",
        description: "Failed to connect Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectGoogleCalendar = () => {
    googleCalendarService.signOut();
    setIsConnected(false);
    setEvents([]);
    toast({
      title: "Disconnected",
      description: "Google Calendar disconnected"
    });
  };

  const fetchEvents = async (startDate: Date, endDate: Date) => {
    if (!isConnected) return;

    setIsLoading(true);
    try {
      const googleEvents = await googleCalendarService.getEvents(startDate, endDate);
      setEvents(googleEvents);
    } catch (error) {
      console.error('Failed to fetch Google Calendar events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch Google Calendar events",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (event: Omit<GoogleCalendarEvent, 'id'>) => {
    if (!isConnected) return;

    try {
      const createdEvent = await googleCalendarService.createEvent(event);
      toast({
        title: "Success",
        description: "Event created in Google Calendar"
      });
      return createdEvent;
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      toast({
        title: "Error",
        description: "Failed to create event in Google Calendar",
        variant: "destructive"
      });
    }
  };

  const syncEventToGoogleCalendar = async (title: string, date: string, time: string, type: string) => {
    if (!isConnected) return;

    const startDateTime = new Date(`${date}T${time}`);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    const event: Omit<GoogleCalendarEvent, 'id'> = {
      summary: title,
      description: `Study event - ${type}`,
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    return await createEvent(event);
  };

  return {
    isConnected,
    isLoading,
    events,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    fetchEvents,
    createEvent,
    syncEventToGoogleCalendar,
  };
};
