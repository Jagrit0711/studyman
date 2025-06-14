
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGitHub: () => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Only handle redirection for SIGNED_IN event and prevent multiple redirects
        if (event === 'SIGNED_IN' && session?.user && !hasRedirected) {
          console.log('User signed in, checking onboarding status...');
          setHasRedirected(true);
          
          // Small delay to prevent conflicts with other navigation
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('onboarding_completed')
                .eq('id', session.user.id)
                .maybeSingle();
              
              console.log('Profile check result:', profile, error);
              
              // Only redirect if we're not already on the target page
              const currentPath = window.location.pathname;
              
              if (error || !profile || !profile.onboarding_completed) {
                if (currentPath !== '/onboarding') {
                  console.log('User needs onboarding, redirecting');
                  window.location.href = '/onboarding';
                }
              } else {
                if (currentPath !== '/dashboard') {
                  console.log('User has completed onboarding, redirecting to dashboard');
                  window.location.href = '/dashboard';
                }
              }
            } catch (error) {
              console.log('Error checking profile:', error);
              if (window.location.pathname !== '/onboarding') {
                window.location.href = '/onboarding';
              }
            }
          }, 100);
        }

        // Reset redirect flag when user signs out
        if (event === 'SIGNED_OUT') {
          setHasRedirected(false);
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [hasRedirected]);

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding`,
          data: metadata
        }
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account, then you'll be redirected to complete your profile."
        });
      }

      return { error };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive"
        });
      }

      return { error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  };

  const signInWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/onboarding`
        }
      });

      if (error) {
        toast({
          title: "GitHub Sign In Error",
          description: error.message,
          variant: "destructive"
        });
      }

      return { error };
    } catch (error) {
      console.error('GitHub sign in error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setHasRedirected(false); // Reset redirect flag
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign Out Error",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Redirect to home page after successful signout
        window.location.href = '/';
      }

      return { error };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signInWithGitHub,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
