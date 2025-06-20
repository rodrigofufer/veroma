import React from 'react';
import { motion } from 'framer-motion';
import { Globe2, Users, TrendingUp, ArrowLeft, Building2, HandshakeIcon, MessageSquareShare, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';

export default function AboutPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Globe2,
      title: "Global Reach",
      description: "Connect with citizens worldwide and address issues that matter across borders."
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Powered by people who care about making a difference in their communities."
    },
    {
      icon: TrendingUp,
      title: "Real Impact",
      description: "Turn ideas into action through collective support and engagement."
    }
  ];

  const impactPartners = [
    {
      icon: Building2,
      title: "Local Governments",
      description: "Direct connection with municipal authorities for local initiatives"
    },
    {
      icon: HandshakeIcon,
      title: "NGO Network",
      description: "Partnerships with non-profit organizations focused on civic improvement"
    },
    {
      icon: MessageSquareShare,
      title: "Community Leaders",
      description: "Engagement with neighborhood and community representatives"
    },
    {
      icon: Megaphone,
      title: "Media Visibility",
      description: "Amplification of trending issues through media partnerships"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="relative h-64 bg-gradient-to-r from-blue-800 to-indigo-900">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="/logowh2.png" 
                  alt="Veroma" 
                  className="h-16"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = '/logowh.png';
                  }}
                />
              </div>
            </div>

            <div className="p-8">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                  About Veroma
                </h1>

                <div className="prose max-w-none">
                  <p className="text-lg text-gray-600 mb-8 text-center">
                    Veroma is a global civic platform designed to bridge the gap between citizens and decision-makers at all levels. Whether it's a pothole in your street or a policy that impacts your continent, we empower individuals to voice concerns, propose solutions, and vote on ideas that matter.
                  </p>

                  <div className="grid md:grid-cols-3 gap-8 mb-12">
                    {features.map((feature, index) => (
                      <motion.div
                        key={feature.title}
                        className="text-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                      >
                        <div className="flex justify-center mb-4">
                          <div className="p-3 bg-blue-50 rounded-xl">
                            <feature.icon className="h-8 w-8 text-blue-800" />
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600">
                          {feature.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
                  <p className="text-gray-600 mb-8">
                    We believe that every voice matters and that collective action can drive meaningful change. Our mission is to create a transparent, accessible platform where citizens worldwide can participate in shaping their communities and influencing decisions that affect their lives.
                  </p>

                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">How Ideas Become Reality</h2>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">From Proposal to Impact</h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-blue-800 font-semibold">1</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Community Support</h4>
                          <p className="text-gray-600">Ideas gain visibility through votes and engagement from other citizens</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-blue-800 font-semibold">2</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Trending Status</h4>
                          <p className="text-gray-600">Popular ideas reach trending status, attracting wider attention</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-blue-800 font-semibold">3</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Partner Network</h4>
                          <p className="text-gray-600">We connect trending ideas with relevant organizations and decision-makers</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-blue-800 font-semibold">4</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Implementation</h4>
                          <p className="text-gray-600">Working with partners to turn viable ideas into real-world changes</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Impact Partners</h2>
                  <p className="text-gray-600 mb-6">
                    We're building a network of partners to help turn great ideas into reality:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {impactPartners.map((partner, index) => (
                      <div key={partner.title} className="flex items-start p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 p-2 bg-white rounded-lg mr-4">
                          <partner.icon className="h-6 w-6 text-blue-800" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{partner.title}</h4>
                          <p className="text-sm text-gray-600">{partner.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Development Stage</h3>
                    <p className="text-gray-600 mb-4">
                      Veroma is currently in its initial phase, focusing on:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 space-y-2">
                      <li>Building a strong user base of engaged citizens</li>
                      <li>Developing partnerships with local organizations</li>
                      <li>Creating impact tracking mechanisms</li>
                      <li>Establishing connections with decision-makers</li>
                    </ul>
                  </div>

                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Join Us</h2>
                  <p className="text-gray-600">
                    Whether you're passionate about local improvements or global change, Veroma provides the platform to make your voice heard. Join our growing community of active citizens and help shape a better future for all.
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
      <BoltBadge />
    </div>
  );
}