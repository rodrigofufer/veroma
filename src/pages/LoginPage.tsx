import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Eye, EyeOff, AlertTriangle, Loader } from 'lucide-react';
import { isSupabaseConfigured, testSupabaseConnection } from '../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Check if Supabase is configured
  useEffect(() => {
    const checkSupabase = async () => {
      const configured = isSupabaseConfigured();
      if (!configured) {
        setSupabaseStatus('error');
        return;
      }
      
      const connectionTest = await testSupabaseConnection();
      setSupabaseStatus(connectionTest ? 'connected' : 'error');
    };
    
    checkSupabase();
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginAttempted(true);
    
    if (supabaseStatus !== 'connected') {
      setError('Database connection error. Please try again later.');
      toast.error('Database connection error. Please try again later.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting to sign in with email:', email);
      toast.loading('Signing in...', { id: 'login', duration: 10000 });
      
      // Attempt to sign in
      await signIn({ email, password });
      toast.dismiss('login');
    } catch (err) {
      console.error('Login error:', err);
      toast.dismiss('login');
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mb-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* This block will be displayed if environment variables are not present */}
          {supabaseStatus === 'error' && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <div className="font-medium text-sm">Database Connection Error</div>
                  <div className="mt-1 text-xs">
                    We're having trouble connecting to our database. This could be due to:
                    <br />• Temporary service disruption
                    <br />• Network connectivity issues
                    <br />• Configuration problems
                  </div>
                  <div className="mt-2 text-xs">Please try again later or contact support if the problem persists.</div>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Generic error block to display any type of error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-1" />
                  <div className="text-sm">{error}</div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email" 
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <div className="text-sm">
                <Link to="/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit" 
                disabled={loading || supabaseStatus !== 'connected'}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center">
                    <Loader className="animate-spin h-4 w-4 mr-2" />
                    Signing in...
                  </span>
                ) : 'Sign in'}
              </button>
              
              {loginAttempted && !error && !loading && (
                <div className="mt-2 text-center text-xs text-gray-500">If you're stuck at "Signing in...", try restarting your browser.</div>
              )}
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link to="/contact" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                Contact support
              </Link>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-4 justify-center">
            <Link to="/support" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Support
            </Link>
            <span className="text-gray-300">|</span>
          </div>
          {loginAttempted && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">Troubleshooting tips:</h3>
              <ul className="text-xs text-yellow-700 space-y-1 list-disc pl-4">
                <li>Make sure your email address is correct</li>
                <li>Check if your email has been verified</li>
                <li>Try clearing your browser cache</li>
                <li>If you keep having issues, try using a different browser</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}