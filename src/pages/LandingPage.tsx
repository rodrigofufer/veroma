import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  Vote,
  LineChart, 
  Globe, 
  BarChart,
  MessageSquare,
  Building2,
  Users,
  Map,
  CheckCircle,
  ChevronDown,
  Mail,
  Shield,
  MapPin,
  Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';
import toast from 'react-hot-toast';

// Impact stats for the platform
const impactStats = [
  { value: "10K+", label: "active citizens" },
  { value: "25K+", label: "ideas shared" },
  { value: "96+", label: "countries represented" },
  { value: "120K+", label: "votes cast" }
];

// Testimonials data
const testimonials = [
  {
    quote: "Veroma gave our community a powerful voice in local development decisions. Our neighborhood improvement proposal gained enough traction to be implemented by the city council.",
    author: "Maria Rodriguez",
    position: "Community Organizer",
    city: "Madrid"
  },
  {
    quote: "As a representative, Veroma helps me understand what matters most to citizens. The platform's voting system provides clear data on priorities and helps us allocate resources accordingly.",
    author: "Carlos Mendez",
    position: "City Council Representative",
    city: "Mexico City"
  },
  {
    quote: "I was able to report a safety issue in my neighborhood anonymously, which was important to me. Within weeks, the problem was addressed by local authorities thanks to community support.",
    author: "Ana Martinez",
    position: "Citizen",
    city: "Buenos Aires"
  }
];

// Featured ideas
const featuredIdeas = [
  {
    title: "Urban Green Spaces Initiative",
    excerpt: "A proposal to transform unused urban spaces into community gardens and mini-parks for environmental and social benefits.",
    image: "https://images.pexels.com/photos/1174732/pexels-photo-1174732.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Environment",
    votes: 342
  },
  {
    title: "Neighborhood Safety Improvement Plan",
    excerpt: "Implementing better street lighting and community watch programs to enhance safety in residential areas.",
    image: "https://images.pexels.com/photos/775219/pexels-photo-775219.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Security",
    votes: 287
  },
  {
    title: "Public Transportation Expansion Proposal",
    excerpt: "Extending public transportation routes to underserved communities and increasing frequency during peak hours.",
    image: "https://images.pexels.com/photos/2132795/pexels-photo-2132795.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Transportation",
    votes: 203
  }
];

// FAQ items
const faqItems = [
  {
    question: "How does the voting system work?",
    answer: "Each user receives 10 votes per week, which reset every Monday. You can use your votes to support ideas that matter to you or oppose ones you disagree with. This weekly limit ensures fair participation and prevents vote manipulation."
  },
  {
    question: "Can I submit ideas anonymously?",
    answer: "Yes, you have the option to submit ideas anonymously. Your identity will remain hidden from other users, though platform administrators can still access this information for moderation purposes if necessary."
  },
  {
    question: "What happens to the most popular ideas?",
    answer: "Popular ideas gain visibility on the platform and may be highlighted to relevant decision-makers. For official proposals submitted by representatives, voting results can directly influence policy decisions depending on the jurisdiction."
  },
  {
    question: "How do I become a verified Representative?",
    answer: "Government officials and authorized representatives can request the Representative role by contacting our support team with official credentials. After verification, you'll be able to create Official Proposals with special visibility and voting features."
  },
  {
    question: "Is Veroma available in my country?",
    answer: "Veroma is a global platform available in any country. The platform will show you ideas and proposals relevant to your selected location, from your local neighborhood to global initiatives."
  }
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ideasRef = useRef(null);
  const contactRef = useRef(null);

  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.4 });
  const ideasInView = useInView(ideasRef, { once: true, amount: 0.3 });
  const contactInView = useInView(contactRef, { once: true, amount: 0.3 });

  const { scrollYProgress } = useScroll();
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -100]);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (user) {
      navigate('/dashboard');
    }
    
    // Auto-rotate testimonials
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [user, navigate]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Message sent successfully. We will contact you soon.');
      
      // Reset form
      setContactForm({
        name: '',
        email: '',
        message: ''
      });
    } catch (error) {
      toast.error('Error sending message. Please try again.');
      console.error('Form submission error:', error);
    } finally {
      setFormSubmitting(false);
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative bg-gradient-to-br from-blue-800 to-indigo-900 text-white pt-20 overflow-hidden"
      >
        {/* Parallax Background Elements */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-20"
          style={{ y: parallaxY }}
        >
          <div className="absolute top-10 left-10 w-48 h-48 bg-white rounded-full opacity-10"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-white rounded-full opacity-10"></div>
          <div className="absolute bottom-20 left-[40%] w-64 h-64 bg-white rounded-full opacity-10"></div>
        </motion.div>
        
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block mb-3 bg-blue-700 bg-opacity-50 px-4 py-1 rounded-full">
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-blue-300" />
                  <span className="text-sm font-medium text-blue-200">Global Civic Platform</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Your Voice, <span className="text-blue-300">From Local to Global</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
                Veroma empowers citizens to raise their concerns, share ideas, and vote on proposals that impact their communities and the world.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-3 bg-white text-blue-800 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                
                <Link
                  to="/login"
                  className="px-8 py-3 bg-blue-700 text-white rounded-lg font-semibold text-lg hover:bg-blue-600 transition-colors border border-blue-600 flex items-center"
                >
                  Sign In
                </Link>
              </div>
              
              <div className="mt-12 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-blue-700 bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white/30">
                      {i}
                    </div>
                  ))}
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-blue-200">More than <span className="font-bold">200+</span> communities participating</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden md:block relative"
            >
              <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img 
                  src="https://images.pexels.com/photos/6150432/pexels-photo-6150432.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Community Participation" 
                  className="w-full h-[500px] object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                    <div className="flex items-center mb-2">
                      <div className="h-3 w-3 rounded-full bg-blue-400 mr-2"></div>
                      <span className="text-white font-medium">Live Voting Data</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/70">Weekly Participation</p>
                        <p className="text-2xl font-bold text-white">1.4K votes</p>
                      </div>
                      <div className="h-16 w-24">
                        <LineChart className="h-full w-full text-blue-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br from-blue-500 to-indigo-400 rounded-3xl -rotate-12 z-[-1] opacity-50 blur-xl"></div>
            </motion.div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
        </div>
      </section>

      {/* Featured Locations Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm font-medium">ACTIVE COMMUNITIES WORLDWIDE</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['New York', 'London', 'Mexico City', 'Madrid', 'Tokyo', 'São Paulo'].map((city, index) => (
              <motion.div
                key={city}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-gray-400 font-medium text-lg"
              >
                {city}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={statsRef}
        className="py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Measurable Civic Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join a growing movement of engaged citizens creating real change in their communities
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                className="bg-white p-6 rounded-xl shadow-md border border-blue-100 text-center hover:shadow-lg transition-shadow"
              >
                <p className="text-4xl md:text-5xl font-bold text-blue-700 mb-2">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-3 bg-blue-100 px-4 py-1 rounded-full">
              <div className="flex items-center">
                <Vote className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Platform Features</span>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How Veroma Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A seamless civic engagement platform designed for maximum impact and accessibility
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 group hover:-translate-y-2"
            >
              <div className="p-4 bg-blue-100 rounded-full inline-block mb-4 group-hover:bg-blue-200 transition-colors">
                <MessageSquare className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Share Ideas</h3>
              <p className="text-gray-600 mb-4">Submit proposals, complaints, or start votes on issues that matter to your community.</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Submit anonymously or publicly</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Multiple categories and types</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 group hover:-translate-y-2"
            >
              <div className="p-4 bg-blue-100 rounded-full inline-block mb-4 group-hover:bg-blue-200 transition-colors">
                <Vote className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Weekly Votes</h3>
              <p className="text-gray-600 mb-4">Every user receives 10 votes per week to support or oppose ideas that matter to them.</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Votes reset every Monday</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Equal voice for all participants</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 group hover:-translate-y-2"
            >
              <div className="p-4 bg-blue-100 rounded-full inline-block mb-4 group-hover:bg-blue-200 transition-colors">
                <Map className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Geo-Focused</h3>
              <p className="text-gray-600 mb-4">View and filter content by location, from your neighborhood to global initiatives.</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Multiple geographic levels</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Country-specific filtering</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={featuresInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-blue-100 group hover:-translate-y-2"
            >
              <div className="p-4 bg-blue-100 rounded-full inline-block mb-4 group-hover:bg-blue-200 transition-colors">
                <Building2 className="h-8 w-8 text-blue-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Official Proposals</h3>
              <p className="text-gray-600 mb-4">Verified representatives can create official proposals with voting deadlines and priority status.</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Transparent governance</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Direct citizen input</span>
                </li>
              </ul>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors shadow-md"
            >
              Join Veroma Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section - Optimized for performance */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block mb-3 bg-blue-100 px-4 py-1 rounded-full">
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Platform Workflow</span>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              From Ideas to Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              How your participation translates into real-world change
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <img 
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Community Meeting" 
                className="rounded-xl shadow-xl w-full h-[400px] object-cover"
                loading="lazy"
              />
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">The Path to Civic Change</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 mt-1 mr-4">
                    <span className="text-lg font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Submit an Idea</h4>
                    <p className="text-gray-600">Share your proposals, raise concerns, or start a vote on issues that matter in your community, city, or worldwide.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 mt-1 mr-4">
                    <span className="text-lg font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Gather Support</h4>
                    <p className="text-gray-600">Community members use their weekly votes to support ideas they believe in, creating a clear picture of priorities.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 mt-1 mr-4">
                    <span className="text-lg font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Reach Decision Makers</h4>
                    <p className="text-gray-600">Popular ideas gain visibility to representatives and authorities who can implement real changes in policy and infrastructure.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-700 mt-1 mr-4">
                    <span className="text-lg font-bold">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Create Change</h4>
                    <p className="text-gray-600">Track implementation progress as ideas transform into real-world actions and improvements in your community.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        ref={testimonialsRef}
        className="py-20 bg-gradient-to-br from-blue-900 to-indigo-800 text-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Voices of Our Community
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Real stories from citizens making a difference through civic participation
            </p>
          </motion.div>

          <div className="relative">
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={
                  testimonialsInView && activeTestimonial === index 
                    ? { opacity: 1, scale: 1, y: 0 } 
                    : { opacity: 0, scale: 0.95, y: 20, position: 'absolute' }
                }
                transition={{ 
                  type: "spring",
                  stiffness: 100, 
                  damping: 15, 
                  duration: 0.8 
                }}
                className={`bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-4xl mx-auto relative ${
                  activeTestimonial !== index ? 'hidden' : ''
                }`}
              >
                <div className="absolute top-8 left-8">
                  <svg className="h-16 w-16 text-blue-300 opacity-30" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                
                <blockquote className="text-xl md:text-2xl text-white mb-8 leading-relaxed font-light mt-12 relative z-10">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white/30">
                      {testimonial.author.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-white text-lg">{testimonial.author}</div>
                    <div className="text-blue-200 text-sm">{testimonial.position}, {testimonial.city}</div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <div className="flex justify-center items-center mt-10">
              <div className="flex space-x-4 items-center">
                <button
                  onClick={() => setActiveTestimonial(prev => (prev - 1 + testimonials.length) % testimonials.length)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Previous testimonial"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex space-x-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveTestimonial(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        activeTestimonial === index 
                          ? 'bg-white w-6' 
                          : 'bg-white/30 hover:bg-white/60'
                      }`}
                      aria-label={`Testimonial ${index + 1}`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={() => setActiveTestimonial(prev => (prev + 1) % testimonials.length)}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Next testimonial"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Ideas Section */}
      <section 
        ref={ideasRef}
        className="py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ideasInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-3 bg-blue-100 px-4 py-1 rounded-full">
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Featured Ideas</span>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trending Proposals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover popular ideas currently gathering support from communities worldwide
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredIdeas.map((idea, index) => (
              <motion.div
                key={idea.title}
                initial={{ opacity: 0, y: 20 }}
                animate={ideasInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <img 
                    src={idea.image}
                    alt={idea.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                      {idea.category}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <div className="flex items-center bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                      <Vote className="h-3.5 w-3.5 mr-1" />
                      <span>{idea.votes} votes</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {idea.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {idea.excerpt}
                  </p>
                  <Link
                    to="/signup"
                    className="inline-flex items-center text-blue-700 hover:text-blue-800 font-medium"
                  >
                    Support this idea
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ideasInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <Link
              to="/signup"
              className="inline-flex items-center px-6 py-3 bg-white text-blue-700 rounded-lg font-medium hover:bg-blue-50 border border-blue-200 transition-colors shadow-sm"
            >
              Explore All Ideas
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-3 bg-blue-100 px-4 py-1 rounded-full">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Frequently Asked Questions</span>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Common Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about participating on Veroma
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-6">
              {faqItems.map((faq, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                  className={`border ${
                    expandedFaq === index 
                      ? 'border-blue-200 bg-blue-50' 
                      : 'border-gray-200 bg-white'
                  } rounded-xl overflow-hidden transition-colors duration-300`}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex justify-between items-center w-full px-6 py-4 text-left focus:outline-none"
                  >
                    <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                    <ChevronDown 
                      className={`h-5 w-5 text-gray-500 transition-transform ${
                        expandedFaq === index ? 'transform rotate-180' : ''
                      }`} 
                    />
                  </button>
                  
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      expandedFaq === index ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section 
        ref={contactRef}
        className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={contactInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-block mb-3 bg-blue-100 px-4 py-1 rounded-full">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Contact Us</span>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Get in Touch With Our Team
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                Have questions about Veroma? Interested in implementing civic technology in your community? We're here to help.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-md mr-4">
                    <Mail className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">hello@veroma.org</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-md mr-4">
                    <Calendar className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Response Time</h3>
                    <p className="text-gray-600">We typically respond within 24-48 business hours</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-md mr-4">
                    <MapPin className="h-6 w-6 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Global Support</h3>
                    <p className="text-gray-600">We offer assistance in multiple languages</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Are you a government representative?</h3>
                <p className="text-gray-600 mb-4">We offer special verification for officials and government representatives, allowing you to create official proposals with enhanced visibility.</p>
                <Link 
                  to="/roles"
                  className="inline-flex items-center text-blue-700 hover:text-blue-800 font-medium"
                >
                  Learn about representative roles
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={contactInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Send us a Message</h3>
                
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name*
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Email*
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="you@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message*
                    </label>
                    <textarea
                      id="message"
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      id="privacy"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="privacy" className="ml-2 block text-sm text-gray-600">
                      I accept the <Link to="/privacy" className="text-blue-700 hover:text-blue-800">Privacy Policy</Link> and the processing of my data.
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {formSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    We respond to all inquiries within 24-48 business hours.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Make Your Voice Heard?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Join thousands of active citizens who are already creating positive change in their communities through Veroma
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-800 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <p className="mt-6 text-blue-200">
              Already have an account? <Link to="/login" className="text-white underline hover:text-blue-100">Sign in</Link>
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
      <BoltBadge />
    </div>
  );
}