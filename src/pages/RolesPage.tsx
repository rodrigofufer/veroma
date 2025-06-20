import React from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, ArrowLeft, CheckCircle, X, Vote, FileEdit, Megaphone, Calendar, TrendingUp, GanttChartSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';

export default function RolesPage() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'user',
      name: 'Citizen',
      icon: Users,
      color: 'gray',
      description: 'Community members who actively participate on the platform',
      permissions: [
        'Create ideas (proposals, complaints, votes)',
        'Vote on ideas (10 votes weekly)',
        'Comment on ideas',
        'Edit your own profile',
        'View all public ideas',
        'Participate in community discussions'
      ],
      restrictions: [
        'No spam or automated content',
        'No offensive or inappropriate content',
        'No misleading information',
        'No impersonation of officials'
      ],
      howToGet: 'Automatic upon registering on the platform',
      examples: [
        'Report a pothole in your neighborhood',
        'Propose a new park',
        'Vote for public transportation improvements',
        'Suggest cultural events'
      ]
    },
    {
      id: 'representative',
      name: 'Representative',
      icon: Building2,
      color: 'purple',
      description: 'Public officials and government representatives',
      permissions: [
        'Everything a citizen can do',
        'Create official proposals with priority',
        'Set voting deadlines',
        'Modify existing official proposals',
        'Access participation metrics',
        'Officially respond to citizen proposals'
      ],
      restrictions: [
        'Must provide accurate information',
        'Must maintain transparency in proposals',
        'No misleading or deceptive content',
        'Must adhere to ethical standards'
      ],
      howToGet: 'Assigned after official identity verification',
      examples: [
        'Propose participatory budgeting',
        'Consult on new public policies',
        'Present infrastructure projects',
        'Request feedback on regulations'
      ]
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      gray: {
        bg: 'bg-gray-100',
        text: 'text-gray-600',
        border: 'border-gray-200',
        hover: 'hover:border-gray-300'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        border: 'border-purple-200',
        hover: 'hover:border-purple-300'
      }
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

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
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Participation Roles in Veroma
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Veroma is a platform for everyone. Whether you're a citizen or a government representative, 
                you can contribute to positive change in your community.
              </p>
            </motion.div>
          </div>

          {/* Roles Grid */}
          <div className="space-y-16">
            {roles.map((role, index) => {
              const colors = getColorClasses(role.color);
              return (
                <motion.div
                  key={role.id}
                  id={role.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 scroll-mt-28"
                >
                  <div className={`p-8 ${colors.bg} border-b ${colors.border}`}>
                    <div className="flex items-center">
                      <div className={`p-3 rounded-xl bg-white/50 ${colors.text} mr-4`}>
                        <role.icon className="h-8 w-8" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900">{role.name}</h2>
                        <p className="text-lg text-gray-600">{role.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                          Capabilities
                        </h3>
                        <ul className="space-y-3">
                          {role.permissions.map((permission, i) => (
                            <li key={i} className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-gray-700">{permission}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <X className="h-5 w-5 text-red-600 mr-2" />
                          Community Guidelines
                        </h3>
                        <ul className="space-y-3">
                          {role.restrictions.map((restriction, i) => (
                            <li key={i} className="flex items-start">
                              <X className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-gray-700">{restriction}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        How to get this role?
                      </h3>
                      <p className="text-gray-700 mb-6">
                        {role.howToGet}
                      </p>

                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        Usage examples
                      </h3>
                      <div className="bg-gray-50 rounded-xl p-6">
                        <ul className="space-y-3">
                          {role.examples.map((example, i) => (
                            <li key={i} className="flex items-start">
                              <span className="h-5 w-5 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                                {i + 1}
                              </span>
                              <span className="text-gray-700">{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Role Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-16 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          >
            <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <h2 className="text-3xl font-bold text-gray-900">Platform Capabilities</h2>
              <p className="text-lg text-gray-600">What you can do on Veroma based on your role</p>
            </div>

            <div className="p-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Capability
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <Users className="h-5 w-5 text-gray-400 mb-1" />
                        <span>Citizen</span>
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <Building2 className="h-5 w-5 text-purple-500 mb-1" />
                        <span>Representative</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                      <FileEdit className="h-5 w-5 text-gray-400 mr-2" />
                      Create ideas
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                      <Vote className="h-5 w-5 text-gray-400 mr-2" />
                      Vote on ideas
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                      <Building2 className="h-5 w-5 text-gray-400 mr-2" />
                      Create official proposals
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      Set voting deadlines
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                      <TrendingUp className="h-5 w-5 text-gray-400 mr-2" />
                      Access detailed metrics
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Representative Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-16 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl shadow-lg overflow-hidden border border-purple-100"
          >
            <div className="p-8">
              <div className="flex items-center mb-6">
                <Building2 className="h-8 w-8 text-purple-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Are You a Government Representative?</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Benefits for Representatives
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Building2 className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Official representation of your government institution</span>
                    </li>
                    <li className="flex items-start">
                      <Megaphone className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Greater visibility for your proposals</span>
                    </li>
                    <li className="flex items-start">
                      <Vote className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Priority in the voting system</span>
                    </li>
                    <li className="flex items-start">
                      <Calendar className="h-5 w-5 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
                      <span className="text-gray-700">Ability to set voting deadlines</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    How to Become a Representative
                  </h3>
                  <p className="text-gray-700 mb-4">
                    If you represent a government institution or public entity, 
                    you can request the Representative role on Veroma.
                  </p>
                  <ol className="space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 font-semibold text-sm mr-2">1</span>
                      <span className="text-gray-700">Register as a citizen</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 font-semibold text-sm mr-2">2</span>
                      <span className="text-gray-700">Contact support with official documentation</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 font-semibold text-sm mr-2">3</span>
                      <span className="text-gray-700">Complete the verification process</span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-800 font-semibold text-sm mr-2">4</span>
                      <span className="text-gray-700">Receive training on platform usage</span>
                    </li>
                  </ol>
                  <button
                    onClick={() => navigate('/contact')}
                    className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Building2 className="h-5 w-5 mr-2" />
                    Request Representative Role
                  </button>
                </div>
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