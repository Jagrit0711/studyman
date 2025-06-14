
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void;
      client: {
        init: (config: {
          apiKey: string;
          discoveryDocs: string[];
        }) => Promise<void>;
        calendar: {
          events: {
            list: (params: {
              calendarId: string;
              timeMin: string;
              timeMax: string;
              showDeleted: boolean;
              singleEvents: boolean;
              orderBy: string;
            }) => Promise<{ result: { items: any[] } }>;
            insert: (params: {
              calendarId: string;
              resource: any;
            }) => Promise<{ result: any }>;
            update: (params: {
              calendarId: string;
              eventId: string;
              resource: any;
            }) => Promise<{ result: any }>;
            delete: (params: {
              calendarId: string;
              eventId: string;
            }) => Promise<void>;
          };
        };
        getToken: () => any;
        setToken: (token: string) => void;
      };
    };
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: string | ((response: any) => void);
          }) => {
            callback: ((response: any) => void) | string;
            requestAccessToken: (config: { prompt: string }) => void;
          };
          revoke: (token: string) => void;
        };
      };
    };
  }
}

export {};
