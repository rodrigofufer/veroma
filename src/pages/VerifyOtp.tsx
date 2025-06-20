import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function VerifyOtp() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [remainingTime, setRemainingTime] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get email from location state or query params
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const stateEmail = location.state?.email;
    
    if (emailParam || stateEmail) {
      setEmail(emailParam || stateEmail);
    } else {
      navigate('/login');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setTimeout(() => setRemainingTime(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [remainingTime]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6 || !/^\d+$/.test(code)) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email'
      });

      if (error) throw error;

      toast.success('Email verified successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (remainingTime > 0) return;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) throw error;

      setRemainingTime(60);
      toast.success('Verification code sent successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification code');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <img src="/logobk.png" alt="Veroma" className="h-12 w-auto mx-auto mb-6" />
          
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 rounded-full p-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Enter verification code
          </h1>
          <p className="text-gray-600">
            We sent a code to <span className="font-medium">{email}</span>
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleVerify}>
            <div className="mb-6">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 6-digit code"
                className="w-full text-center text-3xl tracking-[1em] py-4 border-b-2 border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                loading || code.length !== 6
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              } transition-colors duration-200`}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={remainingTime > 0}
                className={`text-sm text-blue-600 hover:text-blue-800 ${
                  remainingTime > 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {remainingTime > 0 
                  ? `Resend code in ${remainingTime}s` 
                  : "Didn't receive the code? Resend"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to login
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}