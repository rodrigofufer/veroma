import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, RefreshCw, Home, Loader, AlertTriangle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resendVerificationEmail, checkEmailVerification, user, refreshSession } = useAuth();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error' | 'waiting'>('waiting');
  const [error, setError] = useState<string>('');
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Get email from location state or current user
  const email = location.state?.email || user?.email;

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        // Check if we have state from signup
        const message = location.state?.message;

        if (email && message) {
          // This is from signup flow - just show the message
          setVerificationStatus('waiting');
          return;
        }

        // Get the hash fragment and convert it to searchParams
        const hashParams = new URLSearchParams(location.hash.replace('#', ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (errorParam) {
          console.error('Verification error:', errorDescription);
          setError(errorDescription || 'Verification failed');
          setVerificationStatus('error');
          return;
        }

        if (!accessToken || !refreshToken) {
          // No tokens in URL - this might be a fresh load waiting for email
          setVerificationStatus('waiting');
          return;
        }

        setVerificationStatus('verifying');

        // Set the session using the tokens
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

        if (sessionError) throw sessionError;

        // Get the current session to ensure it's set
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
        
        if (getSessionError) throw getSessionError;
        
        if (!session) {
          throw new Error('Session not established after verification');
        }

        // Sync email confirmation status with profiles table
        try {
          const { error: syncError } = await supabase.rpc('sync_user_email_confirmation', {
            user_id: session.user.id
          });

          if (syncError) {
            console.error('Error syncing email confirmation:', syncError);
          }
        } catch (syncError) {
          console.error('Error calling sync function:', syncError);
        }

        setVerificationStatus('success');
        toast.success('Email verified successfully!');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
        
      } catch (err: unknown) {
        console.error('Verification error:', err);
        const message = err instanceof Error ? err.message : 'Error verifying email';
        setError(message);
        setVerificationStatus('error');
      }
    };

    handleEmailVerification();
  }, [location, navigate, retryCount, email]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('No email address found. Please try signing up again.');
      navigate('/signup');
      return;
    }

    setResending(true);
    try {
      console.log('Attempting to resend verification email to:', email);
      await resendVerificationEmail(email);
      toast.success('Verification email sent successfully!');
    } catch (error: unknown) {
      console.error('Failed to resend verification email:', error);
      const message = error instanceof Error ? error.message : 'Failed to send verification email';
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      // First refresh the session to get the latest state
      await refreshSession();
      
      const isVerified = await checkEmailVerification();
      if (isVerified) {
        toast.success('Email verified successfully!');
        navigate('/dashboard');
      } else {
        toast.error('Email not yet verified. Please check your email and click the verification link.');
      }
    } catch (error) {
      toast.error('Failed to check verification status');
      console.error('Failed to check verification status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleRetry = () => {
    setVerificationStatus('verifying');
    setRetryCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div 
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <img 
            src="/logobk2.png" 
            alt="Veroma" 
            className="h-12 w-auto mx-auto mb-6"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = '/logobk.png';
            }}
          />
          
          <div className="flex justify-center mb-6">
            <div className={`rounded-full p-4 ${
              verificationStatus === 'success' ? 'bg-green-100' : 
              verificationStatus === 'error' ? 'bg-red-100' : 
              verificationStatus === 'verifying' ? 'bg-blue-100' :
              'bg-blue-100'
            }`}>
              {verificationStatus === 'success' ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : verificationStatus === 'error' ? (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              ) : verificationStatus === 'verifying' ? (
                <Loader className="h-8 w-8 text-blue-600 animate-spin" />
              ) : (
                <Mail className="h-8 w-8 text-blue-600" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {verificationStatus === 'waiting' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-gray-600 mb-4">
                {location.state?.message || 'We sent you a verification email. Please check your inbox and click the link to activate your account.'}
              </p>
              {email && (
                <p className="text-sm text-gray-500 mb-6">
                  Sent to: {email}
                </p>
              )}
              
              <div className="space-y-3">
                <button
                  onClick={handleCheckVerification}
                  disabled={checking}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {checking ? (
                    <>
                      <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      I've verified my email
                    </>
                  )}
                </button>

                <button
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="w-full flex items-center justify-center px-6 py-3 border border-blue-800 text-blue-800 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? (
                    <>
                      <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Resend verification email'
                  )}
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center justify-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Back to Home
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">
                  Didn't receive the email?
                </h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure you entered the correct email address</li>
                  <li>• Wait a few minutes for the email to arrive</li>
                  <li>• Try resending the verification email</li>
                </ul>
              </div>
            </motion.div>
          )}

          {verificationStatus === 'verifying' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Verifying your email
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </motion.div>
          )}

          {verificationStatus === 'success' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Email Verified Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Welcome to Veroma! Your email has been verified and you can now access all features.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full px-6 py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors shadow-sm hover:shadow-md"
              >
                Continue to Dashboard
              </button>
            </motion.div>
          )}

          {verificationStatus === 'error' && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-4">
                {error || 'There was an error verifying your email. Please try again or contact support.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleRetry}
                  className="w-full flex items-center justify-center px-6 py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Retry Verification
                </button>
                
                <button
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="w-full flex items-center justify-center px-6 py-3 border border-blue-800 text-blue-800 rounded-lg font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? (
                    <>
                      <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                      Sending...
                    </>
                  ) : (
                    'Resend verification email'
                  )}
                </button>
                
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Back to login
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}