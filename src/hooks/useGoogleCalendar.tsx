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
  eventType?: 'study' | 'exam' | 'assignment' | 'meeting';
}

export const useGoogleCalendar = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const initializeGoogleCalendar = async () => {
      try {
        console.log('Initializing Google Calendar...');
        await googleCalendarService.initialize();
        
        const connected = googleCalendarService.isSignedIn();
        console.log('Google Calendar connection status after init:', connected);
        setIsConnected(connected);
        
        if (connected) {
          console.log('Already connected, verifying with a test fetch...');
          try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 1);
            await googleCalendarService.getEventsWithTypes(startDate, endDate);
            console.log('Connection verified successfully');
          } catch (error) {
            console.log('Connection verification failed, may need to re-authenticate');
            setIsConnected(false);
            localStorage.removeItem('google_calendar_token');
          }
        }
      } catch (error) {
        console.error('Failed to initialize Google Calendar:', error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize Google Calendar service",
          variant: "destructive"
        });
      }
    };

    initializeGoogleCalendar();
  }, [toast]);

  const connectGoogleCalendar = async () => {
    setIsLoading(true);
    try {
      console.log('Connecting to Google Calendar...');
      await googleCalendarService.requestAccessToken();
      
      const connected = googleCalendarService.isSignedIn();
      console.log('Connection verification:', connected);
      
      if (connected) {
        setIsConnected(true);
        toast({
          title: "Success",
          description: "Google Calendar connected successfully"
        });
      } else {
        throw new Error('Connection verification failed');
      }
    } catch (error) {
      console.error('Failed to connect Google Calendar:', error);
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect Google Calendar",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectGoogleCalendar = () => {
    try {
      googleCalendarService.signOut();
      setIsConnected(false);
      setEvents([]);
      toast({
        title: "Disconnected",
        description: "Google Calendar disconnected"
      });
    } catch (error) {
      console.error('Failed to disconnect Google Calendar:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar",
        variant: "destructive"
      });
    }
  };

  const fetchEvents = async (startDate: Date, endDate: Date) => {
    if (!isConnected) {
      console.log('Not connected to Google Calendar, skipping fetch');
      return [];
    }

    setIsLoading(true);
    try {
      console.log('Fetching Google Calendar events...');
      const googleEvents = await googleCalendarService.getEventsWithTypes(startDate, endDate);
      console.log('Fetched events:', googleEvents);
      setEvents(googleEvents);
      return googleEvents;
    } catch (error) {
      console.error('Failed to fetch Google Calendar events:', error);
      
      if (error.message?.includes('unauthorized') || error.message?.includes('invalid_token')) {
        console.log('Token might be expired, marking as disconnected');
        setIsConnected(false);
        localStorage.removeItem('google_calendar_token');
      }
      
      toast({
        title: "Fetch Error",
        description: error instanceof Error ? error.message : "Failed to fetch Google Calendar events",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const createEvent = async (event: Omit<GoogleCalendarEvent, 'id'>) => {
    if (!isConnected) {
      throw new Error('Not connected to Google Calendar');
    }

    try {
      console.log('Creating Google Calendar event:', event);
      const createdEvent = await googleCalendarService.createEvent(event);
      console.log('Event created successfully:', createdEvent);
      
      setEvents(prev => [...prev, createdEvent]);
      
      toast({
        title: "Success",
        description: "Event created in Google Calendar"
      });
      return createdEvent;
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create event in Google Calendar";
      toast({
        title: "Creation Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  };

  const syncEventToGoogleCalendar = async (title: string, date: string, time: string, type: string) => {
    if (!isConnected) {
      console.log('Not connected to Google Calendar, skipping sync');
      return null;
    }

    try {
      const startDateTime = new Date(`${date}T${time}`);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

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

      console.log('Syncing event to Google Calendar:', event);
      return await createEvent(event);
    } catch (error) {
      console.error('Failed to sync event to Google Calendar:', error);
      throw error;
    }
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
