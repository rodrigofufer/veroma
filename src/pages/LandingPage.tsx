import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Globe, Vote, Users, CheckCircle, MapPin, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    countries: 0,
    ideas: 0,
    users: 0
  });

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user) {
      navigate('/dashboard');
    }

    // Fetch public stats
    const fetchStats = async () => {
      try {
        // In a real app, you would fetch these from an API
        setStats({
          countries: 45,
          ideas: 1250,
          users: 3800
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user, navigate]);

  const features = [
    {
      icon: Vote,
      title: "Weekly Voting System",
      description: "10 votes per week to support the ideas that matter most to you"
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "From your neighborhood to the entire world, your voice matters"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of citizens committed to positive change"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-800 text-white">
        <Header />
        
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Your Voice, From Local to Global
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Veroma empowers citizens to raise their concerns, share ideas, and vote on proposals that impact their communities and the world.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-3 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 bg-blue-800 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors border border-blue-700"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-2xl"></div>
                <img 
                  src="/veroma.png" 
                  alt="Veroma Platform" 
                  className="rounded-2xl shadow-2xl w-full"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-blue-800 mb-2">{stats.countries}+</div>
              <div className="text-gray-600">Countries</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-blue-800 mb-2">{stats.ideas}+</div>
              <div className="text-gray-600">Ideas Shared</div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl font-bold text-blue-800 mb-2">{stats.users}+</div>
              <div className="text-gray-600">Active Users</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Veroma Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A simple yet powerful platform for civic engagement at any scale
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-blue-100 rounded-full">
                    <feature.icon className="h-8 w-8 text-blue-800" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              From Idea to Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how your participation creates real change
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-12 top-0 bottom-0 w-1 bg-blue-100 hidden md:block"></div>
            
            <div className="space-y-16">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex flex-col md:flex-row gap-8"
              >
                <div className="md:w-24 flex-shrink-0 flex md:justify-center">
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-800 z-10">
                    <MapPin className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Share Your Idea</h3>
                  <p className="text-lg text-gray-600 mb-4">
                    Post a proposal, complaint, or vote about any issue in your community or beyond.
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <p className="text-gray-700">
                        Choose your location level - from neighborhood to global
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col md:flex-row gap-8"
              >
                <div className="md:w-24 flex-shrink-0 flex md:justify-center">
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-800 z-10">
                    <Vote className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Gather Support</h3>
                  <p className="text-lg text-gray-600 mb-4">
                    Community members vote on ideas, with the most popular rising to the top.
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <p className="text-gray-700">
                        Each user gets 10 votes per week to ensure fair participation
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col md:flex-row gap-8"
              >
                <div className="md:w-24 flex-shrink-0 flex md:justify-center">
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-800 z-10">
                    <Calendar className="h-6 w-6" />
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Track Progress</h3>
                  <p className="text-lg text-gray-600 mb-4">
                    Follow the journey of your idea from proposal to implementation.
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                      <p className="text-gray-700">
                        Official proposals have voting deadlines and priority status
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-blue-900 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of citizens who are already creating positive change in their communities and beyond.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-900 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Join Veroma Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </div>

      <Footer />
      <BoltBadge />
    </div>
  );
}