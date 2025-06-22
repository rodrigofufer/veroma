import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Sparkles, Users, Globe, Vote, RefreshCw, Loader, AlertTriangle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function EmailConfirmationSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(true);
  const [confirmationSuccess, setConfirmationSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [processingMessage, setProcessingMessage] = useState('Confirming your email...');
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('Starting email confirmation process');
        setProcessingMessage('Confirming your email...');
        setError(null);
        
        // Get the hash fragment and convert it to searchParams
        const hashParams = new URLSearchParams(location.hash.replace('#', ''));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        console.log('Confirmation tokens:', { 
          accessToken: !!accessToken, 
          refreshToken: !!refreshToken, 
          type,
          error: errorParam,
          errorDescription
        });

        if (errorParam) {
          console.error('Confirmation error:', errorDescription);
          setError('Error confirming email: ' + (errorDescription || 'Unknown error'));
          setIsProcessing(false);
          return;
        }

        if (!accessToken || !refreshToken) {
          // No valid confirmation tokens
          console.log('No valid tokens found, checking if already verified');
          
          // Check if user is already logged in and verified
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user?.email_confirmed_at) {
            console.log('User is already verified:', session.user.email);
            setUserEmail(session.user.email || '');
            setConfirmationSuccess(true);
            setIsProcessing(false);
            toast.success('Email already verified!');
            return;
          }
          
          setError('Invalid confirmation link. Please try again or request a new verification email.');
          setIsProcessing(false);
          return;
        }

        console.log('Setting session with tokens...');
        setProcessingMessage('Setting up your account...');

        // Set the session using the tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Error confirming email: ' + sessionError.message);
          setIsProcessing(false);
          return;
        }

        console.log('Session set successfully:', data.session?.user?.email_confirmed_at);
        setProcessingMessage('Verifying your account...');

        // Verify the session was set correctly
        const { data: { session }, error: getSessionError } = await supabase.auth.getSession();
        
        if (getSessionError) {
          console.error('Failed to get session:', getSessionError);
          setError('Error confirming email: ' + getSessionError.message);
          setIsProcessing(false);
          return;
        }

        if (!session) {
          console.error('No session after setting tokens');
          setError('Error confirming email: No session established');
          setIsProcessing(false);
          return;
        }

        console.log('Session verified, user email confirmed:', session.user.email_confirmed_at);
        setProcessingMessage('Finalizing your account...');

        // Update the profiles table to sync email confirmation
        if (session.user.email_confirmed_at) {
          try {
            const { error: syncError } = await supabase.rpc('sync_user_email_confirmation', {
              user_id: session.user.id
            });

            if (syncError) {
              console.error('Error syncing email confirmation:', syncError);
              // Continue anyway since the auth confirmation worked
            } else {
              console.log('Email confirmation synced successfully');
            }
          } catch (syncErr) {
            console.error('Error calling sync function:', syncErr);
            
            // Fallback: try direct update if RPC fails
            try {
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ email_confirmed_at: session.user.email_confirmed_at })
                .eq('id', session.user.id);

              if (updateError) {
                console.error('Error updating profile directly:', updateError);
              } else {
                console.log('Profile updated directly successfully');
              }
            } catch (updateError) {
              console.error('Error in fallback update:', updateError);
            }
          }
        }

        // Email confirmation successful
        setUserEmail(session.user.email || '');
        setConfirmationSuccess(true);
        setIsProcessing(false);
        
        toast.success('Email confirmed successfully!');
        
        } catch (err: unknown) {
          console.error('Confirmation error:', err);
          const message = err instanceof Error ? err.message : 'Unknown error';
          setError('Error confirming email: ' + message);
          setIsProcessing(false);
        }
    };

    handleEmailConfirmation();
  }, [location, retryCount]);

  const handleContinueToDashboard = () => {
    navigate('/dashboard');
  };

  const handleRetry = () => {
    setIsProcessing(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  };

  const handleCheckVerification = async () => {
    try {
      setProcessingMessage('Checking verification status...');
      setIsProcessing(true);
      setError(null);
      
      // Get the current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (session?.user?.email_confirmed_at) {
        setUserEmail(session.user.email || '');
        setConfirmationSuccess(true);
        toast.success('Email confirmed successfully!');
      } else {
        setError('Your email is not yet verified. Please check your inbox and click the verification link.');
        setConfirmationSuccess(false);
      }
    } catch (error: unknown) {
      console.error('Error checking verification:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError('Failed to check verification status: ' + message);
      setConfirmationSuccess(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const features = [
    {
      icon: Vote,
      title: "10 Weekly Votes",
      description: "Every week you receive 10 votes to support the ideas that matter most to you"
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "From your neighborhood to the entire world, your voice can create real change"
    },
    {
      icon: Users,
      title: "Active Community",
      description: "Join thousands of citizens committed to positive change"
    }
  ];

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <motion.div 
          className="text-center max-w-md w-full bg-white p-8 rounded-xl shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center mb-6">
            <Loader className="h-16 w-16 text-blue-800 animate-spin" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {processingMessage}
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your account
          </p>
        </motion.div>
      </div>
    );
  }

  if (error || !confirmationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
        <motion.div 
          className="max-w-md w-full text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-4">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Verification Issue
            </h2>
            <p className="text-gray-600 mb-6">
              {error || "There was a problem confirming your email. The link may have expired or already been used."}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleCheckVerification}
                className="w-full px-6 py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 transition-colors"
              >
                Check Verification Status
              </button>
              <button
                onClick={handleRetry}
                className="w-full flex items-center justify-center px-6 py-3 border border-blue-800 text-blue-800 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Retry Confirmation
              </button>
              <button
                onClick={() => navigate('/verify-email')}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Resend confirmation email
              </button>
              <button
                onClick={handleGoToLogin}
                className="w-full px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 bg-grid-pattern" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 text-green-200"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sparkles className="h-8 w-8" />
        </motion.div>
        <motion.div
          className="absolute top-40 right-20 text-blue-200"
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Vote className="h-6 w-6" />
        </motion.div>
        <motion.div
          className="absolute bottom-40 left-20 text-purple-200"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 3, 0]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          <Globe className="h-10 w-10" />
        </motion.div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <motion.div 
          className="max-w-4xl w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Success Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-12 text-center text-white relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.3,
                  type: "spring",
                  stiffness: 200,
                  damping: 10
                }}
                className="relative z-10"
              >
                <div className="flex justify-center mb-6">
                  <div className="bg-white/20 rounded-full p-6">
                    <CheckCircle className="h-16 w-16 text-white" />
                  </div>
                </div>
                
                <motion.h1 
                  className="text-4xl md:text-5xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  Email Confirmed!
                </motion.h1>
                
                <motion.p 
                  className="text-xl md:text-2xl text-green-100 mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  Your email has been successfully confirmed
                </motion.p>
                
                {userEmail && (
                  <motion.p 
                    className="text-green-200 text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                  >
                    {userEmail}
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Content Section */}
            <div className="px-8 py-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="text-center mb-12"
              >
                <img 
                  src="/logobk2.png" 
                  alt="Veroma" 
                  className="h-12 w-auto mx-auto mb-6"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/logobk.png';
                  }}
                />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Welcome to Veroma!
                </h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Your voice is now part of a global community committed to positive change.
                  From your neighborhood to the entire world, every idea counts.
                </p>
              </motion.div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 + index * 0.2 }}
                    className="text-center group"
                  >
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-300 group-hover:scale-110">
                        <feature.icon className="h-8 w-8 text-blue-800" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.1 }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Ready to make a difference?
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Explore ideas from your community, share your proposals, and use your weekly votes
                    to support changes that really matter.
                  </p>
                  
                  <motion.button
                    onClick={handleContinueToDashboard}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-800 to-indigo-800 text-white rounded-xl font-semibold text-lg hover:from-blue-900 hover:to-indigo-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </motion.button>
                </div>

                <motion.p 
                  className="text-sm text-gray-500"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.5 }}
                >
                  Your account is fully activated and ready to use
                </motion.p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <style>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 0);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}