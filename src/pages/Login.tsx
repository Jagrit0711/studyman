
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff, Mail, Lock, Github } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGitHub, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in - but wait for auth to load
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (!error) {
      // Don't manually navigate - let the auth state change handler do it
      console.log('Login successful, waiting for auth state change...');
    }
    
    setLoading(false);
  };

  const handleGitHubSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGitHub();
    if (error) {
      setLoading(false);
    }
    // Don't set loading to false on success - the redirect will happen
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-notion-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-notion-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-notion-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-notion-gray-900 font-mono">Zylo Study</h1>
            <p className="text-sm text-notion-gray-500">by Zylon Labs</p>
          </div>
        </div>

        <Card className="notion-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleGitHubSignIn}
              disabled={loading}
            >
              <Github className="w-4 h-4 mr-2" />
              Continue with GitHub
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-notion-gray-500">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 w-4 h-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 notion-input"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 w-4 h-4" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 notion-input"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-notion-gray-400 hover:text-notion-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Link
                  to="/forgot-password"
                  className="text-sm text-notion-gray-600 hover:text-notion-gray-900 underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-notion-gray-900 hover:bg-notion-gray-800"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            <div className="text-center">
              <span className="text-sm text-notion-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-notion-gray-900 hover:underline font-medium">
                  Sign up
                </Link>
              </span>
            </div>

            <div className="pt-4 border-t border-notion-gray-200">
              <div className="flex justify-center space-x-4 text-xs text-notion-gray-500">
                <Link to="/privacy-policy" className="hover:text-notion-gray-700 underline">
                  Privacy Policy
                </Link>
                <span>•</span>
                <Link to="/terms-conditions" className="hover:text-notion-gray-700 underline">
                  Terms & Conditions
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
