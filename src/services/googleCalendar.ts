
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
  private apiKey = 'AIzaSyA6Y5AVrUqTQw-VsV1h3SK25IMuITi9oXQ';
  private discoveryDoc = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  private scopes = 'https://www.googleapis.com/auth/calendar';
  
  private gapi: any = null;
  private google: any = null;
  private tokenClient: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) {
      console.log('Google Calendar service already initialized');
      return;
    }

    console.log('Starting Google Calendar initialization...');

    // Check if API key is still the placeholder
    if (this.apiKey === 'AIzaSyA6Y5AVrUqTQw-VsV1h3SK25IMuITi9oXQ') {
      console.warn('Using placeholder API key - Google Calendar features may not work properly');
      // Don't throw error, allow initialization to continue for testing
    }

    try {
      // Load Google APIs
      console.log('Loading Google APIs...');
      await this.loadGoogleAPIs();
      console.log('Google APIs loaded successfully');
      
      // Initialize Google API client
      console.log('Initializing Google API client...');
      await new Promise((resolve, reject) => {
        this.gapi.load('client', async () => {
          try {
            await this.gapi.client.init({
              apiKey: this.apiKey,
              discoveryDocs: [this.discoveryDoc],
            });
            console.log('Google API client initialized successfully');
            resolve(true);
          } catch (error) {
            console.error('Error initializing Google API client:', error);
            reject(error);
          }
        });
      });

      // Initialize Google Identity Services
      console.log('Initializing Google Identity Services...');
      this.tokenClient = this.google.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: this.scopes,
        callback: '', // Will be set when requesting access
      });
      console.log('Google Identity Services initialized successfully');

      this.isInitialized = true;
      console.log('Google Calendar service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Calendar service:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        apiKey: this.apiKey ? 'Set' : 'Not set',
        clientId: this.clientId ? 'Set' : 'Not set'
      });
      throw error;
    }
  }

  private loadGoogleAPIs(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('Checking if Google APIs are already loaded...');
      
      if (typeof window !== 'undefined' && window.gapi && window.google) {
        console.log('Google APIs already available');
        this.gapi = window.gapi;
        this.google = window.google;
        resolve();
        return;
      }

      console.log('Loading Google API script...');
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        console.log('Google API script loaded');
        this.gapi = window.gapi;
        
        // Load Google Identity Services
        console.log('Loading Google Identity Services script...');
        const gisScript = document.createElement('script');
        gisScript.src = 'https://accounts.google.com/gsi/client';
        gisScript.onload = () => {
          console.log('Google Identity Services script loaded');
          this.google = window.google;
          
          // Add a small delay to ensure scripts are fully loaded
          setTimeout(() => {
            resolve();
          }, 100);
        };
        gisScript.onerror = (error) => {
          console.error('Failed to load Google Identity Services script:', error);
          reject(new Error('Failed to load Google Identity Services'));
        };
        document.head.appendChild(gisScript);
      };
      script.onerror = (error) => {
        console.error('Failed to load Google API script:', error);
        reject(new Error('Failed to load Google API'));
      };
      document.head.appendChild(script);
    });
  }

  async requestAccessToken(): Promise<string> {
    if (!this.isInitialized) {
      console.error('Google Calendar service not initialized');
      throw new Error('Google Calendar service not initialized. Please ensure initialization completed successfully.');
    }

    console.log('Requesting Google Calendar access token...');

    return new Promise((resolve, reject) => {
      try {
        this.tokenClient.callback = (resp: any) => {
          console.log('Token response received:', { 
            hasError: !!resp.error, 
            hasToken: !!resp.access_token 
          });
          
          if (resp.error !== undefined) {
            console.error('Google OAuth error:', resp);
            reject(new Error(resp.error_description || resp.error || 'Authorization failed'));
            return;
          }
          
          if (!resp.access_token) {
            console.error('No access token received');
            reject(new Error('No access token received from Google'));
            return;
          }
          
          console.log('Google Calendar access token received successfully');
          resolve(resp.access_token);
        };

        const existingToken = this.gapi.client.getToken();
        console.log('Existing token:', existingToken ? 'Found' : 'None');

        if (existingToken === null) {
          console.log('Requesting new token with consent...');
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
        } else {
          console.log('Requesting token refresh...');
          this.tokenClient.requestAccessToken({ prompt: '' });
        }
      } catch (error) {
        console.error('Error in requestAccessToken:', error);
        reject(error);
      }
    });
  }

  async getEvents(startDate: Date, endDate: Date): Promise<GoogleCalendarEvent[]> {
    console.log('Checking Google Calendar sign-in status...');
    
    if (!this.isSignedIn()) {
      console.error('Not signed in to Google Calendar');
      throw new Error('Not signed in to Google Calendar');
    }

    try {
      console.log('Fetching Google Calendar events from', startDate.toISOString(), 'to', endDate.toISOString());
      
      const request = await this.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });

      console.log('Google Calendar events response:', request.result);
      const events = request.result.items || [];
      console.log(`Retrieved ${events.length} events from Google Calendar`);
      return events;
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw new Error(`Failed to fetch events from Google Calendar: ${error.message}`);
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
      throw new Error(`Failed to create event in Google Calendar: ${error.message}`);
    }
  }

  async updateEvent(eventId: string, event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> {
    if (!this.isSignedIn()) {
      throw new Error('Not signed in to Google Calendar');
    }

    try {
      console.log('Updating Google Calendar event:', eventId);
      
      const request = await this.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });

      console.log('Google Calendar event updated:', request.result);
      return request.result;
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      throw new Error(`Failed to update event in Google Calendar: ${error.message}`);
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.isSignedIn()) {
      throw new Error('Not signed in to Google Calendar');
    }

    try {
      console.log('Deleting Google Calendar event:', eventId);
      
      await this.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
      
      console.log('Google Calendar event deleted successfully');
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      throw new Error(`Failed to delete event from Google Calendar: ${error.message}`);
    }
  }

  isSignedIn(): boolean {
    const token = this.gapi?.client?.getToken();
    const signedIn = token !== null && token !== undefined;
    console.log('Google Calendar sign-in status:', signedIn);
    return signedIn;
  }

  signOut() {
    try {
      console.log('Signing out from Google Calendar...');
      const token = this.gapi.client.getToken();
      if (token !== null) {
        this.google.accounts.oauth2.revoke(token.access_token);
        this.gapi.client.setToken('');
      }
      console.log('Google Calendar signed out successfully');
    } catch (error) {
      console.error('Error signing out from Google Calendar:', error);
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
