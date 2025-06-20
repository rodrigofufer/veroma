import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MessageCircle, Send, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      // In a real implementation, you would send this to your backend
      // For now, we'll simulate sending and redirect to email client
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mailtoLink = `mailto:hello@veroma.org?subject=Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(message)}`;
      window.location.href = mailtoLink;
      
      toast.success('Opening your email client...');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="md:flex">
              {/* Contact Info Section */}
              <div className="bg-gradient-to-br from-blue-800 to-indigo-900 p-8 text-white md:w-1/3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-2">Email Us</h3>
                      <a 
                        href="mailto:hello@veroma.org"
                        className="flex items-center text-blue-100 hover:text-white transition-colors"
                      >
                        <Mail className="h-5 w-5 mr-2" />
                        hello@veroma.org
                      </a>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Response Time</h3>
                      <p className="text-blue-100">
                        We aim to respond to all inquiries within 24-48 hours during business days.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">Office Hours</h3>
                      <p className="text-blue-100">
                        Monday - Friday<br />
                        9:00 AM - 6:00 PM UTC
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(-1)}
                    className="mt-8 flex items-center text-blue-100 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Go Back
                  </button>
                </motion.div>
              </div>

              {/* Contact Form Section */}
              <div className="p-8 md:w-2/3">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Send us a Message
                  </h1>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="How can we help you?"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={sending}
                      className="w-full flex items-center justify-center px-6 py-3 bg-blue-800 text-white rounded-lg font-medium hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? (
                        <>
                          <MessageCircle className="animate-spin h-5 w-5 mr-2" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
      <BoltBadge />
    </div>
  );
}