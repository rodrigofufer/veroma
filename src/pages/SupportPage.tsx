import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Book, MessageCircle, FileText, ArrowLeft, ExternalLink, Mail, ChevronDown, ChevronUp, Shield, Users, Globe, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';
import toast from 'react-hot-toast';

export default function SupportPage() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [contactFormVisible, setContactFormVisible] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const faqs = [
    {
      question: "How does the voting system work?",
      answer: "Each user receives 10 votes per week. Votes reset every Monday at 00:00 UTC. You can use your votes to support or oppose ideas, and you can change or remove your votes at any time. This system ensures fair participation while preventing vote manipulation."
    },
    {
      question: "Can I post anonymously?",
      answer: "Yes, you can choose to post ideas anonymously. Your identity will be hidden from other users, but we still maintain internal records for moderation purposes. Anonymous posting allows you to share sensitive ideas without revealing your identity to the community."
    },
    {
      question: "How are ideas moderated?",
      answer: "We have community guidelines that all content must follow. Our moderation team reviews reported content and takes appropriate action to maintain a constructive environment. This includes removing content that violates our terms of service and issuing warnings to users who repeatedly break the rules."
    },
    {
      question: "What happens to successful ideas?",
      answer: "Popular ideas gain visibility and may be featured in our global trending section. We also work with local organizations and authorities to help implement viable proposals. Ideas with significant support are shared with relevant decision-makers who can take action."
    },
    {
      question: "How do I become a Representative?",
      answer: "Representatives are verified government officials or authorized spokespersons for public institutions. To apply for Representative status, contact our support team with official documentation proving your position. Our verification team will review your application and grant the appropriate permissions."
    },
    {
      question: "Can I edit or delete my ideas after posting?",
      answer: "Yes, you can edit or delete your own ideas at any time. However, if your idea has already received votes or comments, consider that editing might affect the context of those interactions. For transparency, edit history is visible to moderators."
    },
    {
      question: "Is my data secure on Veroma?",
      answer: "We take data security seriously. All personal information is encrypted and stored securely. We never share your personal data with third parties without your consent. For more details, please review our Privacy Policy."
    }
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of using Veroma",
      icon: Book,
      link: "/guide",
      color: "blue"
    },
    {
      title: "Community Guidelines",
      description: "Our rules for constructive participation",
      icon: FileText,
      link: "/guidelines",
      color: "green"
    },
    {
      title: "Contact Support",
      description: "Get help from our team",
      icon: MessageCircle,
      link: "#contact-form",
      color: "purple",
      action: () => setContactFormVisible(true)
    }
  ];

  const quickLinks = [
    {
      title: "Weekly Voting",
      description: "How the voting system works",
      icon: Calendar,
      link: "/guide#voting"
    },
    {
      title: "Anonymous Posting",
      description: "Privacy options for sharing ideas",
      icon: Shield,
      link: "/guide#privacy"
    },
    {
      title: "Global Participation",
      description: "Contributing from anywhere",
      icon: Globe,
      link: "/guide#global"
    },
    {
      title: "Representative Roles",
      description: "Official government participation",
      icon: Users,
      link: "/roles#representative"
    }
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // In a real implementation, you would send this to your backend
      // For now, we'll simulate sending and redirect to email client
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mailtoLink = `mailto:hello@veroma.org?subject=Contact from ${encodeURIComponent(contactForm.name)}&body=${encodeURIComponent(contactForm.message)}`;
      window.location.href = mailtoLink;
      
      toast.success('Opening your email client...');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

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
                <HelpCircle className="h-8 w-8 text-blue-800 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
              </div>

              {/* Quick Links */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {quickLinks.map((link, index) => (
                    <motion.a
                      key={index}
                      href={link.link}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col items-center text-center"
                      whileHover={{ y: -5 }}
                    >
                      <div className="bg-blue-50 p-2 rounded-full mb-2">
                        <link.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm">{link.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{link.description}</p>
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Resources Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Resources</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {resources.map((resource, index) => (
                    <motion.div
                      key={resource.title}
                      className={`p-6 bg-${resource.color}-50 rounded-xl hover:bg-${resource.color}-100 transition-colors cursor-pointer`}
                      whileHover={{ y: -4 }}
                      onClick={() => {
                        if (resource.action) {
                          resource.action();
                        } else {
                          navigate(resource.link);
                        }
                      }}
                    >
                      <resource.icon className={`h-8 w-8 text-${resource.color}-600 mb-4`} />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                      <p className="text-gray-600 text-sm">{resource.description}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* FAQs Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      className="border border-gray-200 rounded-lg overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <button
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors text-left"
                        onClick={() => toggleFaq(index)}
                      >
                        <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                        {expandedFaq === index ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      
                      <motion.div
                        initial={false}
                        animate={{ height: expandedFaq === index ? 'auto' : 0, opacity: expandedFaq === index ? 1 : 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <p className="text-gray-600">{faq.answer}</p>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Contact Form Section */}
              <motion.section 
                className="bg-blue-50 rounded-xl p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageCircle className="h-5 w-5 text-blue-600 mr-2" />
                  Still Need Help?
                </h2>
                
                {!contactFormVisible ? (
                  <div>
                    <p className="text-gray-600 mb-4">
                      Our support team is available to help you with any questions or issues you may have.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => setContactFormVisible(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                      >
                        <Mail className="h-5 w-5 mr-2" />
                        Contact Support
                      </button>
                      <a
                        href="https://docs.veroma.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 border border-blue-800 text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <ExternalLink className="h-5 w-5 mr-2" />
                        Documentation
                      </a>
                    </div>
                  </div>
                ) : (
                  <motion.form 
                    onSubmit={handleContactSubmit}
                    className="space-y-4"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Your Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Your Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        id="subject"
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {submitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setContactFormVisible(false)}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.form>
                )}
              </motion.section>

              {/* Security Notice */}
              <section className="mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                  <div className="bg-blue-100 p-2 rounded-full mr-3 flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-800 mb-1">Security Notice</h3>
                    <p className="text-sm text-blue-700">
                      Veroma will never ask for your password via email. Report suspicious activity to security@veroma.org.
                    </p>
                  </div>
                </div>
              </section>

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