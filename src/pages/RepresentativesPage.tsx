import React from 'react';
import { motion } from 'framer-motion';
import { Building2, ArrowLeft, Calendar, Vote, FileEdit, Megaphone, Users, CheckCircle, AlertTriangle, HelpCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';

export default function RepresentativesPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Building2,
      title: "Official Proposals",
      description: "Create proposals with official designation that receive priority on the platform"
    },
    {
      icon: Calendar,
      title: "Voting Deadlines",
      description: "Set voting deadlines for your official proposals"
    },
    {
      icon: Vote,
      title: "Detailed Metrics",
      description: "Access detailed statistics about citizen participation"
    },
    {
      icon: Megaphone,
      title: "Official Responses",
      description: "Respond officially to citizen proposals"
    }
  ];

  const steps = [
    {
      title: "Create an Official Proposal",
      description: "Access the 'New Official Proposal' option in your control panel",
      icon: FileEdit
    },
    {
      title: "Define Details",
      description: "Specify title, description, category, and location of the proposal",
      icon: Building2
    },
    {
      title: "Set Deadline",
      description: "Define a deadline for voting (between 1 day and 1 year)",
      icon: Calendar
    },
    {
      title: "Publish and Promote",
      description: "The proposal is marked as official and receives priority on the platform",
      icon: Megaphone
    }
  ];

  const faqs = [
    {
      question: "Who can be a Representative?",
      answer: "Public officials, elected representatives, leaders of government organizations, and people with official roles in public institutions can apply for the Representative role. Each application goes through a verification process."
    },
    {
      question: "How are Representatives verified?",
      answer: "Applicants must provide official documentation that proves their position, such as government credentials, appointment letters, or official documents. Our team verifies this information before granting the role."
    },
    {
      question: "What responsibilities do Representatives have?",
      answer: "Representatives must use the platform ethically, present truthful proposals, respond to citizen concerns, and maintain transparency in their actions. Their activities are audited to ensure compliance with these responsibilities."
    },
    {
      question: "Can Representatives moderate content?",
      answer: "No, Representatives do not have moderation capabilities. They can only create and manage official proposals. Moderation is handled by our platform team."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-24 pb-16 px-4">
        <motion.div 
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl overflow-hidden shadow-xl mb-16">
            <div className="px-8 py-16 md:px-16 md:py-20 text-white">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-3xl"
              >
                <div className="flex items-center mb-6">
                  <Building2 className="h-10 w-10 mr-4" />
                  <h1 className="text-4xl md:text-5xl font-bold">Government Representatives</h1>
                </div>
                <p className="text-xl md:text-2xl text-purple-100 mb-8 leading-relaxed">
                  Representatives are public officials who can create priority 
                  proposals and establish formal citizen consultations on the platform.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => navigate('/contact')}
                    className="px-6 py-3 bg-white text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors shadow-md"
                  >
                    Request Representative Role
                  </button>
                  <button
                    onClick={() => navigate('/roles')}
                    className="px-6 py-3 bg-purple-500 bg-opacity-30 text-white rounded-lg font-medium hover:bg-opacity-40 transition-colors"
                  >
                    View All Roles
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Special Capabilities
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature) => (
                <motion.div
                  key={feature.title}
                  className="bg-white p-8 rounded-xl shadow-md border border-gray-100 hover:border-purple-200 transition-all duration-300"
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                      <feature.icon className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          >
            <div className="p-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="text-lg text-gray-600">The process for creating official proposals as a Representative</p>
            </div>

            <div className="p-8">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-6 top-8 bottom-8 w-1 bg-purple-100 hidden md:block"></div>
                
                <div className="space-y-12">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.title}
                      className="flex flex-col md:flex-row gap-6"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                    >
                      <div className="flex-shrink-0 flex items-start">
                        <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 text-purple-600 z-10">
                          <step.icon className="h-6 w-6" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16 grid md:grid-cols-2 gap-8"
          >
            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center mb-6">
                <Users className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Benefits for Citizens</h2>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Access to verified official proposals</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Greater transparency in government processes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Direct participation in official decisions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Direct communication with representatives</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Tracking proposals with defined deadlines</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md border border-gray-100">
              <div className="flex items-center mb-6">
                <Building2 className="h-8 w-8 text-purple-600 mr-3" />
                <h2 className="text-2xl font-bold text-gray-900">Benefits for Institutions</h2>
              </div>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Direct communication channel with citizens</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Immediate feedback on proposals</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Detailed metrics on citizen participation</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Greater legitimacy in consultation processes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-gray-700">Secure and audited platform for public consultations</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-16 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          >
            <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <div className="flex items-center">
                <HelpCircle className="h-8 w-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
              </div>
            </div>

            <div className="p-8">
              <div className="space-y-8">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-start">
                      <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 font-semibold text-sm mr-2">Q</span>
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 pl-8">
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-16 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl overflow-hidden shadow-xl"
          >
            <div className="p-8 md:p-12 text-white">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-3xl font-bold mb-6">Ready to represent your institution?</h2>
                <p className="text-xl text-purple-100 mb-8 leading-relaxed">
                  If you're a public official or government representative, request your access as a Representative 
                  and start creating official proposals on the platform.
                </p>
                <button
                  onClick={() => navigate('/contact')}
                  className="inline-flex items-center px-8 py-4 bg-white text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors shadow-md"
                >
                  Request Verification
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Warning Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-16 bg-yellow-50 rounded-xl p-6 border border-yellow-200"
          >
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important: Representative Responsibilities</h3>
                <p className="text-yellow-800 text-sm mb-4">
                  The Representative role carries significant responsibilities. All actions performed 
                  with this role are audited and must comply with public transparency and ethics standards.
                </p>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Official proposals must be truthful and transparent</li>
                  <li>• Information provided must be accurate and up-to-date</li>
                  <li>• Misuse of the role may result in revocation</li>
                  <li>• Official proposals are subject to greater public scrutiny</li>
                </ul>
              </div>
            </div>
          </motion.div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </div>
        </motion.div>
      </main>

      <Footer />
      <BoltBadge />
    </div>
  );
}