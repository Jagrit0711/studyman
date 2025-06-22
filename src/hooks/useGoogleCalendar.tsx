import { useState, useEffect, useCallback } from 'react';
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
  const [isInitializing, setIsInitializing] = useState(true);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const initializeGoogleCalendar = async () => {
      setIsInitializing(true);
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
      } finally {
        setIsInitializing(false);
      }
    };

    initializeGoogleCalendar();
  }, [toast]);

  const connectGoogleCalendar = useCallback(async () => {
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
  }, [toast]);

  const disconnectGoogleCalendar = useCallback(() => {
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
  }, [toast]);

  const fetchEvents = useCallback(async (startDate: Date, endDate: Date) => {
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
  }, [isConnected, toast]);

  const createEvent = useCallback(async (event: Omit<GoogleCalendarEvent, 'id'>) => {
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
      console.error('Failed to create Google Calendar event. Full error:', JSON.stringify(error, null, 2));
      const errorMessage = error instanceof Error ? error.message : "Failed to create event in Google Calendar";
      toast({
        title: "Creation Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  }, [isConnected, toast]);

  const updateEvent = useCallback(async (eventId: string, event: Partial<GoogleCalendarEvent>) => {
    if (!isConnected) {
      throw new Error('Not connected to Google Calendar');
    }
    try {
      const updatedEvent = await googleCalendarService.updateEvent(eventId, event);
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...updatedEvent } : e));
      toast({
        title: "Success",
        description: "Event updated in Google Calendar"
      });
      return updatedEvent;
    } catch (error) {
      toast({
        title: "Update Error",
        description: error instanceof Error ? error.message : "Failed to update event",
        variant: "destructive"
      });
      throw error;
    }
  }, [isConnected, toast]);

  const getEvent = useCallback(async (eventId: string) => {
    if (!isConnected) {
      throw new Error('Not connected to Google Calendar');
    }
    try {
      return await googleCalendarService.getEvent(eventId);
    } catch (error) {
       console.error(`Failed to get event ${eventId}:`, error);
      const errorMessage = error instanceof Error ? error.message : "Failed to get event details";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      throw error;
    }
  }, [isConnected, toast]);

  const syncEventToGoogleCalendar = useCallback(async (title: string, date: string, time: string, type: string) => {
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
  }, [isConnected, createEvent]);

  return {
    isConnected,
    isLoading,
    isInitializing,
    events,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    fetchEvents,
    createEvent,
    updateEvent,
    getEvent,
    syncEventToGoogleCalendar,
  };
};
