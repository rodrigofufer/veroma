import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { 
  ArrowRight, 
  Leaf, 
  LineChart, 
  Globe, 
  BarChart, 
  Wind, 
  Droplets, 
  Sun, 
  LightbulbIcon, 
  Building2, 
  Users,
  CheckCircle,
  ChevronDown,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BoltBadge from '../components/BoltBadge';
import toast from 'react-hot-toast';

// Environment impact stats
const impactStats = [
  { value: "42M", label: "tons of CO2 reduced" },
  { value: "64%", label: "less energy consumption" },
  { value: "87%", label: "client retention rate" },
  { value: "120+", label: "projects implemented" }
];

// Testimonials data
const testimonials = [
  {
    quote: "EcoTech completely transformed our corporate carbon footprint. Their innovative solutions reduced our energy consumption by 47% in the first year.",
    author: "Maria Rodriguez",
    position: "Sustainability Director",
    company: "GreenCorp Industries"
  },
  {
    quote: "The implementation of EcoTech's smart sensors allowed us to optimize our manufacturing processes while reducing waste by 38%.",
    author: "Carlos Mendez",
    position: "Operations Director",
    company: "TechSolutions Global"
  },
  {
    quote: "Their environmental data analysis platform helped us identify improvement opportunities we would never have seen. The ROI exceeded our expectations.",
    author: "Ana Martinez",
    position: "CEO",
    company: "Innovatech"
  }
];

// Blog posts
const blogPosts = [
  {
    title: "AI in Service of the Planet: New Applications for Environmental Monitoring",
    excerpt: "Discover how artificial intelligence is revolutionizing the way we monitor and protect our natural resources.",
    image: "https://images.pexels.com/photos/7108/notebook-computer-chill-relax.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Innovation"
  },
  {
    title: "Solar Microgrids: The Future of Energy in Rural Areas",
    excerpt: "Solar microgrids are transforming rural communities around the world, providing access to clean and sustainable energy.",
    image: "https://images.pexels.com/photos/356036/pexels-photo-356036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Energy"
  },
  {
    title: "Blockchain for Certification of Sustainable Supply Chains",
    excerpt: "Blockchain technology is creating new possibilities for verifying and certifying sustainable practices in global supply chains.",
    image: "https://images.pexels.com/photos/8853512/pexels-photo-8853512.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    category: "Technology"
  }
];

// FAQ items
const faqItems = [
  {
    question: "How can your solutions reduce our carbon footprint?",
    answer: "Our solutions combine IoT technologies, AI, and data analysis to optimize energy consumption, reduce waste, and improve operational efficiency. Typically, our clients see a 30-60% reduction in their carbon footprint within the first year of implementation."
  },
  {
    question: "Which sectors can benefit from your technology?",
    answer: "Our solutions are adaptable to multiple sectors, including manufacturing, agriculture, construction, energy, transportation, and urban management. We customize each implementation according to the specific needs of each industry and client."
  },
  {
    question: "How long does it take to implement your solutions?",
    answer: "Implementation time varies according to the scale and complexity of the project. For basic solutions, we can complete implementation in 2-4 weeks. More complex projects can take between 2-6 months. We offer a free initial assessment to provide you with a personalized timeline."
  },
  {
    question: "How do you measure and verify environmental impact?",
    answer: "We use a combination of high-precision IoT sensors, advanced analysis algorithms, and international measurement standards (such as GHG Protocol and ISO 14064). All data is verified by independent third parties, and we provide detailed reports with transparent and verifiable metrics."
  },
  {
    question: "Do you offer consulting services in addition to technology?",
    answer: "Yes, in addition to our technological solutions, we offer comprehensive sustainability consulting services, including environmental impact assessment, ESG strategy development, training, and certification in international standards."
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
    company: '',
    message: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);

  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const solutionsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const blogRef = useRef(null);
  const contactRef = useRef(null);

  const statsInView = useInView(statsRef, { once: true, amount: 0.3 });
  const solutionsInView = useInView(solutionsRef, { once: true, amount: 0.2 });
  const testimonialsInView = useInView(testimonialsRef, { once: true, amount: 0.4 });
  const blogInView = useInView(blogRef, { once: true, amount: 0.3 });
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
        company: '',
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
        className="relative bg-gradient-to-br from-green-900 to-emerald-700 text-white pt-20 overflow-hidden"
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
              <div className="inline-block mb-3 bg-green-800 bg-opacity-50 px-4 py-1 rounded-full">
                <div className="flex items-center">
                  <Leaf className="h-4 w-4 mr-2 text-green-300" />
                  <span className="text-sm font-medium text-green-200">Sustainable Technology</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Technological innovation <span className="text-green-300">for a sustainable planet</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-green-100 mb-8 leading-relaxed">
                We transform the way companies interact with the environment through intelligent and sustainable technological solutions.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-3 bg-white text-green-800 rounded-lg font-semibold text-lg hover:bg-green-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                
                <Link
                  to="/login"
                  className="px-8 py-3 bg-green-800 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors border border-green-700 flex items-center"
                >
                  Sign In
                </Link>
              </div>
              
              <div className="mt-12 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded-full border-2 border-green-700 bg-green-${i * 100} flex items-center justify-center overflow-hidden`}>
                      <img 
                        src={`https://randomuser.me/api/portraits/men/${i + 20}.jpg`}
                        alt="Client"
                        className="w-full h-full object-cover"
                      />
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
                  <p className="text-sm text-green-200">More than <span className="font-bold">400+</span> companies trust us</p>
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
                  src="https://images.pexels.com/photos/2559941/pexels-photo-2559941.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Sustainable Technology" 
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/70 to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20">
                    <div className="flex items-center mb-2">
                      <div className="h-3 w-3 rounded-full bg-green-400 mr-2"></div>
                      <span className="text-white font-medium">Real-time Impact</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/70">Emissions reduced</p>
                        <p className="text-2xl font-bold text-white">2.4M tonCO₂</p>
                      </div>
                      <div className="h-16 w-24">
                        <LineChart className="h-full w-full text-green-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br from-green-500 to-emerald-400 rounded-3xl -rotate-12 z-[-1] opacity-50 blur-xl"></div>
            </motion.div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-gray-500 text-sm font-medium">COMPANIES THAT TRUST US</p>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {['Microsoft', 'Coca-Cola', 'Tesla', 'Amazon', 'Google'].map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-gray-400 font-bold text-xl"
              >
                {company}
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
              Measurable Environmental Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our technological solutions generate quantifiable results for the planet and for your business
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={statsInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                className="bg-white p-6 rounded-xl shadow-md border border-green-100 text-center hover:shadow-lg transition-shadow"
              >
                <p className="text-4xl md:text-5xl font-bold text-green-700 mb-2">{stat.value}</p>
                <p className="text-gray-500 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section 
        ref={solutionsRef}
        className="py-20 bg-gradient-to-br from-green-50 to-emerald-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-3 bg-green-100 px-4 py-1 rounded-full">
              <div className="flex items-center">
                <LightbulbIcon className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm font-medium text-green-800">Our Solutions</span>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Sustainable Technologies for the Future
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We combine smart hardware, advanced software, and data analysis to create comprehensive sustainability solutions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-green-100 group hover:-translate-y-2"
            >
              <div className="p-4 bg-green-100 rounded-full inline-block mb-4 group-hover:bg-green-200 transition-colors">
                <Wind className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Energy</h3>
              <p className="text-gray-600 mb-4">Energy management systems that optimize consumption and maximize the use of renewable sources.</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Real-time monitoring</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Predictive algorithms</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-green-100 group hover:-translate-y-2"
            >
              <div className="p-4 bg-green-100 rounded-full inline-block mb-4 group-hover:bg-green-200 transition-colors">
                <Droplets className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Water Management</h3>
              <p className="text-gray-600 mb-4">Smart solutions to monitor, conserve, and optimize the use of water resources.</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Advanced IoT sensors</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Early leak detection</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-green-100 group hover:-translate-y-2"
            >
              <div className="p-4 bg-green-100 rounded-full inline-block mb-4 group-hover:bg-green-200 transition-colors">
                <BarChart className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">ESG Analysis</h3>
              <p className="text-gray-600 mb-4">Platforms to measure, report, and verify environmental, social, and governance metrics.</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Automated reporting</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Blockchain validation</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-green-100 group hover:-translate-y-2"
            >
              <div className="p-4 bg-green-100 rounded-full inline-block mb-4 group-hover:bg-green-200 transition-colors">
                <Sun className="h-8 w-8 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Solar Energy+</h3>
              <p className="text-gray-600 mb-4">Advanced solar energy generation and storage systems with adaptive learning technology.</p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Optimization algorithms</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Smart storage</span>
                </li>
              </ul>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={solutionsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <Link
              to="/contact"
              className="inline-flex items-center px-6 py-3 bg-green-700 text-white rounded-lg font-medium hover:bg-green-800 transition-colors shadow-md"
            >
              Explore All Our Solutions
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-3 bg-green-100 px-4 py-1 rounded-full">
              <div className="flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm font-medium text-green-800">Success Stories</span>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Transforming Companies, Protecting the Planet
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how our technological solutions are creating real impact
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={testimonialsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <img 
                src="https://images.pexels.com/photos/159888/pexels-photo-159888.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Smart Factory Implementation" 
                className="rounded-xl shadow-xl w-full h-[400px] object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={testimonialsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Eco Transformation at GreenCorp Industries</h3>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mt-1 mr-4">
                    <CheckCircle className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">The Challenge</h4>
                    <p className="text-gray-600">GreenCorp was looking to reduce their carbon footprint while improving operational efficiency in their 12 manufacturing plants.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mt-1 mr-4">
                    <CheckCircle className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">The Solution</h4>
                    <p className="text-gray-600">We implemented our EcoSmart® system with over 2,500 IoT sensors and our predictive analysis platform.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mt-1 mr-4">
                    <CheckCircle className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-800">The Results</h4>
                    <p className="text-gray-600">47% reduction in energy consumption, 32% less emissions, and savings of $4.2M in the first year.</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Link
                    to="/case-studies"
                    className="inline-flex items-center text-green-700 hover:text-green-800 font-medium"
                  >
                    Read full case study
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        ref={testimonialsRef}
        className="py-20 bg-gradient-to-br from-green-900 to-emerald-800 text-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={testimonialsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Our Clients Say
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Companies that are leading the change towards a sustainable future
            </p>
          </motion.div>

          <div className="relative">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                animate={
                  testimonialsInView && activeTestimonial === index 
                    ? { opacity: 1, x: 0 } 
                    : { opacity: 0, x: 50 }
                }
                transition={{ duration: 0.7 }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 max-w-4xl mx-auto"
              >
                <div className="mb-6">
                  <svg className="h-12 w-12 text-green-300 opacity-60" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                
                <blockquote className="text-xl md:text-2xl text-white mb-8 leading-relaxed font-light">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center">
                  <div className="mr-4">
                    <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-bold text-xl">
                      {testimonial.author.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-white">{testimonial.author}</div>
                    <div className="text-green-200 text-sm">{testimonial.position}, {testimonial.company}</div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    activeTestimonial === index ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section 
        ref={blogRef}
        className="py-20 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={blogInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <div className="inline-block mb-3 bg-green-100 px-4 py-1 rounded-full">
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm font-medium text-green-800">EcoTech Blog</span>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Trends in Green Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our analysis and perspectives on sustainable innovation
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.title}
                initial={{ opacity: 0, y: 20 }}
                animate={blogInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48">
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded">
                      {post.category}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <Link
                    to="/blog"
                    className="inline-flex items-center text-green-700 hover:text-green-800 font-medium"
                  >
                    Read more
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={blogInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <Link
              to="/blog"
              className="inline-flex items-center px-6 py-3 bg-white text-green-700 rounded-lg font-medium hover:bg-green-50 border border-green-200 transition-colors shadow-sm"
            >
              View All Articles
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
            <div className="inline-block mb-3 bg-green-100 px-4 py-1 rounded-full">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-green-600" />
                <span className="text-sm font-medium text-green-800">Frequently Asked Questions</span>
              </div>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              We Answer Your Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to know about our technological solutions
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
                      ? 'border-green-200 bg-green-50' 
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
        className="py-20 bg-gradient-to-br from-green-50 to-emerald-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={contactInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              <div className="inline-block mb-3 bg-green-100 px-4 py-1 rounded-full">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Contact Us</span>
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Start Your Sustainable Transformation
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                We're here to help you implement technological solutions that benefit both your business and the planet.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-md mr-4">
                    <Mail className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">contact@ecotech.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-md mr-4">
                    <Phone className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-white p-3 rounded-full shadow-md mr-4">
                    <MapPin className="h-6 w-6 text-green-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Office</h3>
                    <p className="text-gray-600">123 Green Technology St, San Francisco</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <div className="h-[300px] bg-white rounded-xl shadow-md overflow-hidden">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50470.67784421391!2d-122.431416!3d37.773972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1676911291199!5m2!1sen!2sus" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Office location"
                  ></iframe>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={contactInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">Request Information</h3>
                
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name*
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Corporate Email*
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="youremail@company.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Your company name"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder="How can we help you?"
                    />
                  </div>
                  
                  <div className="flex items-start">
                    <input
                      id="privacy"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                    />
                    <label htmlFor="privacy" className="ml-2 block text-sm text-gray-600">
                      I accept the <Link to="/privacy" className="text-green-700 hover:text-green-800">Privacy Policy</Link> and the processing of my personal data.
                    </label>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-3 px-4 bg-green-700 hover:bg-green-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
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
                    We respond to all inquiries within 24 business hours.
                  </p>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-900 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Begin Your Journey Towards Sustainability
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
              Join hundreds of companies that are already transforming their operations with sustainable technology
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center px-8 py-4 bg-white text-green-800 rounded-lg font-semibold text-lg hover:bg-green-50 transition-colors shadow-lg"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            
            <p className="mt-6 text-green-200">
              Already have an account? <Link to="/login" className="text-white underline hover:text-green-100">Sign in</Link>
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
      <BoltBadge />
    </div>
  );
}