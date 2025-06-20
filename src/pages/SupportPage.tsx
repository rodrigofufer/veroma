import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Book, MessageCircle, FileText, ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';

export default function SupportPage() {
  const navigate = useNavigate();

  const faqs = [
    {
      question: "How does the voting system work?",
      answer: "Each user receives 10 votes per week. Votes reset every Monday at 00:00 UTC. You can use your votes to support or oppose ideas, and you can change or remove your votes at any time."
    },
    {
      question: "Can I post anonymously?",
      answer: "Yes, you can choose to post ideas anonymously. Your identity will be hidden from other users, but we still maintain internal records for moderation purposes."
    },
    {
      question: "How are ideas moderated?",
      answer: "We have community guidelines that all content must follow. Our moderation team reviews reported content and takes appropriate action to maintain a constructive environment."
    },
    {
      question: "What happens to successful ideas?",
      answer: "Popular ideas gain visibility and may be featured in our global trending section. We also work with local organizations and authorities to help implement viable proposals."
    }
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      description: "Learn the basics of using Veroma",
      icon: Book,
      link: "/guide"
    },
    {
      title: "Community Guidelines",
      description: "Our rules for constructive participation",
      icon: FileText,
      link: "/guidelines"
    },
    {
      title: "Contact Support",
      description: "Get help from our team",
      icon: MessageCircle,
      link: "/contact"
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
            <div className="p-8">
              <div className="flex items-center mb-8">
                <HelpCircle className="h-8 w-8 text-blue-800 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
              </div>

              {/* Resources Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Resources</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {resources.map((resource) => (
                    <motion.div
                      key={resource.title}
                      className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(resource.link)}
                    >
                      <resource.icon className="h-8 w-8 text-blue-800 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                      <p className="text-gray-600 text-sm">{resource.description}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* FAQs Section */}
              <section className="mb-12">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
                <div className="space-y-6">
                  {faqs.map((faq, index) => (
                    <motion.div
                      key={index}
                      className="border-b border-gray-200 pb-6 last:border-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h3 className="text-lg font-medium text-gray-900 mb-3">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Contact Section */}
              <section className="bg-blue-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Still Need Help?</h2>
                <p className="text-gray-600 mb-4">
                  Our support team is available to help you with any questions or issues you may have.
                </p>
                <div className="flex flex-wrap gap-4">
                  <a
                    href="mailto:hello@veroma.org"
                    className="inline-flex items-center px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Email Support
                  </a>
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