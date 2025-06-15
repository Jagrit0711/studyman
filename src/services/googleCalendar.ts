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

interface GoogleCalendarResponse {
  items: GoogleCalendarEvent[];
}

class GoogleCalendarService {
  // Your Google OAuth Client ID
  private clientId = '240473196565-7fi2k9hvvts0466180fldca3rr9nikf3.apps.googleusercontent.com';
  // REPLACE THIS WITH YOUR ACTUAL API KEY FROM GOOGLE CLOUD CONSOLE
  private apiKey = 'YOUR_GOOGLE_API_KEY_HERE';
  private discoveryDoc = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  private scopes = 'https://www.googleapis.com/auth/calendar';
  
  private gapi: any = null;
  private google: any = null;
  private tokenClient: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    // Check if API key is set
    if (this.apiKey === 'YOUR_GOOGLE_API_KEY_HERE') {
      throw new Error('Please set your Google API key in the googleCalendar.ts file. You can get one from the Google Cloud Console.');
    }

    try {
      // Load Google APIs
      await this.loadGoogleAPIs();
      
      // Initialize Google API client
      await new Promise((resolve, reject) => {
        this.gapi.load('client', async () => {
          try {
            await this.gapi.client.init({
              apiKey: this.apiKey,
              discoveryDocs: [this.discoveryDoc],
            });
            resolve(true);
          } catch (error) {
            reject(error);
          }
        });
      });

      // Initialize Google Identity Services
      this.tokenClient = this.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: this.scopes,
        callback: '', // Will be set when requesting access
      });

      this.isInitialized = true;
      console.log('Google Calendar service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Calendar service:', error);
      throw error;
    }
  }

  private loadGoogleAPIs(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window.gapi !== 'undefined' && typeof window.google !== 'undefined') {
        this.gapi = window.gapi;
        this.google = window.google;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        this.gapi = window.gapi;
        
        // Load Google Identity Services
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.onload = () => {
          this.google = window.google;
          resolve();
        };
        gisScript.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(gisScript);
      };
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  async requestAccessToken(): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Google Calendar service not initialized');
    }

    return new Promise((resolve, reject) => {
      try {
        this.tokenClient.callback = (resp: any) => {
          if (resp.error !== undefined) {
            console.error('Google OAuth error:', resp);
            reject(new Error(resp.error_description || 'Authorization failed'));
            return;
          }
          console.log('Google Calendar access token received');
          resolve(resp.access_token);
        };

        if (this.gapi.client.getToken() === null) {
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
          this.tokenClient.requestAccessToken({ prompt: '' });
        }
      } catch (error) {
        console.error('Error requesting access token:', error);
        reject(error);
      }
    });
  }

  async getEvents(startDate: Date, endDate: Date): Promise<GoogleCalendarEvent[]> {
    if (!this.isSignedIn()) {
      throw new Error('Not signed in to Google Calendar');
    }

    try {
      console.log('Fetching Google Calendar events from', startDate, 'to', endDate);
      
      const request = await this.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });

      console.log('Google Calendar events response:', request.result);
      return request.result.items || [];
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw new Error('Failed to fetch events from Google Calendar');
    }
  }

  async createEvent(event: Omit<GoogleCalendarEvent, 'id'>): Promise<GoogleCalendarEvent> {
    if (!this.isSignedIn()) {
      throw new Error('Not signed in to Google Calendar');
    }

    try {
      console.log('Creating Google Calendar event:', event);
      
      const request = await this.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      console.log('Google Calendar event created:', request.result);
      return request.result;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw new Error('Failed to create event in Google Calendar');
    }
  }

  async updateEvent(eventId: string, event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> {
    if (!this.isSignedIn()) {
      throw new Error('Not signed in to Google Calendar');
    }

    try {
      const request = await this.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });

      return request.result;
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      throw new Error('Failed to update event in Google Calendar');
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.isSignedIn()) {
      throw new Error('Not signed in to Google Calendar');
    }

    try {
      await this.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      throw new Error('Failed to delete event from Google Calendar');
    }
  }

  isSignedIn(): boolean {
    return this.gapi?.client?.getToken() !== null && this.gapi?.client?.getToken() !== undefined;
  }

  signOut() {
    try {
      const token = this.gapi.client.getToken();
      if (token !== null) {
        this.google.accounts.oauth2.revoke(token.access_token);
        this.gapi.client.setToken('');
      }
      console.log('Google Calendar signed out');
    } catch (error) {
      console.error('Error signing out from Google Calendar:', error);
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
