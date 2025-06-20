import React from 'react';
import { motion } from 'framer-motion';
import { Cookie, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';

export default function CookiesPage() {
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
                <Cookie className="h-8 w-8 text-blue-800 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Cookie Policy</h1>
              </div>

              <div className="text-sm text-gray-500 mb-8">
                Last updated: {lastUpdated}
              </div>

              <div className="prose max-w-none">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. What Are Cookies?</h2>
                <p className="text-gray-600 mb-6">
                  Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our platform.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Types of Cookies We Use</h2>
                
                <h3 className="text-xl font-medium text-gray-800 mb-3">2.1 Essential Cookies</h3>
                <p className="text-gray-600 mb-6">
                  These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You may disable these by changing your browser settings, but this may affect how the website functions.
                </p>

                <h3 className="text-xl font-medium text-gray-800 mb-3">2.2 Analytics Cookies</h3>
                <p className="text-gray-600 mb-6">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our platform.
                </p>

                <h3 className="text-xl font-medium text-gray-800 mb-3">2.3 Functional Cookies</h3>
                <p className="text-gray-600 mb-6">
                  These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Cookies</h2>
                <p className="text-gray-600 mb-4">We use cookies to:</p>
                <ul className="list-disc pl-6 text-gray-600 mb-6">
                  <li className="mb-2">Remember your login status using the `veroma_session` cookie</li>
                  <li className="mb-2">Maintain your preferences</li>
                  <li className="mb-2">Understand how you use our platform</li>
                  <li className="mb-2">Improve our services</li>
                  <li className="mb-2">Provide secure authentication</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Managing Cookies</h2>
                <p className="text-gray-600 mb-6">
                  Most web browsers allow you to control cookies through their settings preferences. However, limiting cookies may impact your experience of our website.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Cookies</h2>
                <p className="text-gray-600 mb-6">
                  We use services from third-party providers who may also set cookies on our behalf. These services include analytics and authentication providers.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Updates to This Policy</h2>
                <p className="text-gray-600 mb-6">
                  We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                </p>

                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
                <p className="text-gray-600">
                  If you have questions about our use of cookies, please contact us at{' '}
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