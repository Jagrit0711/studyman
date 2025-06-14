
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
  private clientId = '240473196565-7fi2k9hvvts0466180fldca3rr9nikf3.apps.googleusercontent.com';
  private apiKey = 'YOUR_API_KEY'; // You'll need to get this from Google Cloud Console
  private discoveryDoc = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
  private scopes = 'https://www.googleapis.com/auth/calendar';
  
  private gapi: any = null;
  private tokenClient: any = null;
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    // Load Google APIs
    await this.loadGoogleAPIs();
    
    // Initialize Google API client
    await this.gapi.load('client', async () => {
      await this.gapi.client.init({
        apiKey: this.apiKey,
        discoveryDocs: [this.discoveryDoc],
      });
    });

    // Initialize Google Identity Services
    this.tokenClient = this.google.accounts.oauth2.initTokenClient({
      client_id: this.clientId,
      scope: this.scopes,
      callback: '', // Will be set when requesting access
    });

    this.isInitialized = true;
  }

  private loadGoogleAPIs(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window.gapi !== 'undefined') {
        this.gapi = window.gapi;
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
        gisScript.onerror = reject;
        document.head.appendChild(gisScript);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async requestAccessToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.tokenClient.callback = (resp: any) => {
        if (resp.error !== undefined) {
          reject(resp);
          return;
        }
        resolve(resp.access_token);
      };

      if (this.gapi.client.getToken() === null) {
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } else {
        this.tokenClient.requestAccessToken({ prompt: '' });
      }
    });
  }

  async getEvents(startDate: Date, endDate: Date): Promise<GoogleCalendarEvent[]> {
    try {
      const request = await this.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        showDeleted: false,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return request.result.items || [];
    } catch (error) {
      console.error('Error fetching Google Calendar events:', error);
      throw error;
    }
  }

  async createEvent(event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> {
    try {
      const request = await this.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      return request.result;
    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      throw error;
    }
  }

  async updateEvent(eventId: string, event: GoogleCalendarEvent): Promise<GoogleCalendarEvent> {
    try {
      const request = await this.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        resource: event,
      });

      return request.result;
    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      throw error;
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      throw error;
    }
  }

  isSignedIn(): boolean {
    return this.gapi?.client?.getToken() !== null;
  }

  signOut() {
    const token = this.gapi.client.getToken();
    if (token !== null) {
      this.google.accounts.oauth2.revoke(token.access_token);
      this.gapi.client.setToken('');
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
