import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';

export default function TermsPage() {
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
                <Shield className="h-8 w-8 text-blue-800 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
              </div>

              <div className="text-sm text-gray-500 mb-8">
                Last updated: {lastUpdated}
              </div>

              <div className="prose max-w-none">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
                <p className="text-gray-600 mb-6">
                  Welcome to Veroma. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully before using our services.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Definitions</h2>
                <ul className="list-disc pl-6 text-gray-600 mb-6">
                  <li className="mb-2">"Platform" refers to Veroma's website, applications, and services.</li>
                  <li className="mb-2">"User" refers to any individual or entity that accesses or uses the Platform.</li>
                  <li className="mb-2">"Content" refers to any information, text, graphics, or other materials uploaded, downloaded, or appearing on the Platform.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
                <p className="text-gray-600 mb-6">
                  Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account. Users must provide accurate and complete information when creating an account.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Content Guidelines</h2>
                <p className="text-gray-600 mb-6">
                  Users agree not to post content that:
                </p>
                <ul className="list-disc pl-6 text-gray-600 mb-6">
                  <li className="mb-2">Is unlawful, harmful, threatening, abusive, harassing, defamatory, or invasive of privacy</li>
                  <li className="mb-2">Infringes any patent, trademark, trade secret, copyright, or other proprietary rights</li>
                  <li className="mb-2">Contains software viruses or any other malicious code</li>
                  <li className="mb-2">Interferes with or disrupts the Platform or servers</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Voting System</h2>
                <p className="text-gray-600 mb-6">
                  Users receive a weekly allocation of votes to participate in the platform. The voting system is designed to ensure fair and meaningful participation while preventing abuse.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Privacy</h2>
                <p className="text-gray-600 mb-6">
                  Our collection and use of personal information is governed by our Privacy Policy. By using the Platform, you consent to our data practices as described in the Privacy Policy.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to Terms</h2>
                <p className="text-gray-600 mb-6">
                  We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Platform.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact</h2>
                <p className="text-gray-600">
                  If you have any questions about these Terms, please contact us at{' '}
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