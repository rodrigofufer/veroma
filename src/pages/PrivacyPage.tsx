import React from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';

export default function PrivacyPage() {
  const navigate = useNavigate();
  const lastUpdated = "March 1, 2025";

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
            <div className="p-8">
              <div className="flex items-center mb-8">
                <Lock className="h-8 w-8 text-blue-800 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
              </div>

              <div className="text-sm text-gray-500 mb-8">
                Last updated: {lastUpdated}
              </div>

              <div className="prose max-w-none">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-600 mb-6">
                  Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use Veroma.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Information You Provide</h3>
                <ul className="list-disc pl-6 text-gray-600 mb-6">
                  <li className="mb-2">Account information (name, email, country)</li>
                  <li className="mb-2">Profile information</li>
                  <li className="mb-2">Content you post (ideas, proposals, votes)</li>
                  <li className="mb-2">Communications with us</li>
                </ul>

                <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Automatically Collected Information</h3>
                <ul className="list-disc pl-6 text-gray-600 mb-6">
                  <li className="mb-2">Device information</li>
                  <li className="mb-2">Usage data</li>
                  <li className="mb-2">Location data</li>
                  <li className="mb-2">Cookies and similar technologies</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-600 mb-4">We use the collected information to:</p>
                <ul className="list-disc pl-6 text-gray-600 mb-6">
                  <li className="mb-2">Provide and maintain our services</li>
                  <li className="mb-2">Personalize your experience</li>
                  <li className="mb-2">Process your votes and ideas</li>
                  <li className="mb-2">Communicate with you</li>
                  <li className="mb-2">Improve our platform</li>
                  <li className="mb-2">Ensure platform security</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing</h2>
                <p className="text-gray-600 mb-6">
                  We do not sell your personal information. We may share your information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-6">
                  <li className="mb-2">With your consent</li>
                  <li className="mb-2">To comply with legal obligations</li>
                  <li className="mb-2">To protect our rights and safety</li>
                  <li className="mb-2">With service providers who assist in our operations</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
                <p className="text-gray-600 mb-6">
                  We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
                <p className="text-gray-600 mb-4">You have the right to:</p>
                <ul className="list-disc pl-6 text-gray-600 mb-6">
                  <li className="mb-2">Access your personal information</li>
                  <li className="mb-2">Correct inaccurate information</li>
                  <li className="mb-2">Request deletion of your information</li>
                  <li className="mb-2">Object to processing of your information</li>
                  <li className="mb-2">Withdraw consent</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
                <p className="text-gray-600">
                  If you have questions about this Privacy Policy, please contact us at{' '}
                  <a href="mailto:hello@veroma.org" className="text-blue-600 hover:text-blue-800">
                    hello@veroma.org
                  </a>
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
        </motion.div>
      </main>

      <Footer />
      <BoltBadge />
    </div>
  );
}