import React, { useState, useEffect } from 'react';
import {
  Star,
  Users,
  LayoutTemplate,
  Wallet2,
  Settings,
  FileText,
  BadgeCheck,
  BarChart3,
  ArrowRight,
  Menu,
  X,
  FileSignature,
  Zap,
  Clock
} from 'lucide-react';
import Footer from './Footer'; // Assuming you have a light-themed Footer component
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Note: The mouse-following gradient and particles might be very subtle on a white background,
  // but they can add a touch of texture. They are kept here but can be removed if desired.
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  ;
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <LayoutTemplate className="w-8 h-8 text-purple-600" />,
      title: "Theme-Based Quotation Templates",
      description: "Choose from a library of professionally designed, <span class='text-purple-600 font-semibold'>stunning templates</span> tailored for the wedding and photography industry.",
    },
    {
      icon: <Wallet2 className="w-8 h-8 text-purple-600" />,
      title: "Smart Credit System",
      description: "A flexible, <span class='text-purple-600 font-semibold'>pay-per-estimate</span> model using credits — perfect for seasonal businesses. Buy credits and use them as needed.",
    },
    {
      icon: <Settings className="w-8 h-8 text-purple-600" />,
      title: "Customizable Services & Pricing",
      description: "Personalize your service list, add terms, and adjust pricing on the fly. Your offering is <span class='text-purple-600 font-semibold'>fully customizable</span>.",
    },
    {
      icon: <FileText className="w-8 h-8 text-purple-600" />,
      title: "Secure PDF Generation & Sharing",
      description: "Instantly generate high-quality PDFs and share them via link or email. <span class='text-purple-600 font-semibold'>Secure sharing</span>, all from your dashboard.",
    },
    {
      icon: <BadgeCheck className="w-8 h-8 text-purple-600" />,
      title: "Studio Profile & Branding",
      description: "Add your logo and contact details to every quote. Make your brand stand out with <span class='text-purple-600 font-semibold'>your brand, your quote</span>.",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: "Dashboard & Insights",
      description: "Track estimate performance and lead conversion with simple analytics to grow your business. (Coming Soon)",
    }
  ];

  const testimonials = [
    {
      name: "Pooja Arora",
      role: "Founder, Blissful Weddings",
      content: "Quote Karo has changed the way we send estimates. The designs are beautiful, and clients love the clarity. It’s helped us book more weddings with less back-and-forth.",
      rating: 5,
      avatar: "🎉"
    },
    {
      name: "Rakesh S.",
      role: "Freelance Candid Photographer",
      content: "Earlier, making quotations was a manual mess. Now, it’s plug and play. I just select a template and send — all in 2 minutes!",
      rating: 5,
      avatar: "📸"
    }
  ];

  const stats = [
    { number: "10K+", label: "Estimates Generated", icon: <FileText className="w-6 h-6 text-gray-500" /> },
    { number: "500+", label: "Studios Registered", icon: <Users className="w-6 h-6 text-gray-500" /> },
    { number: "90%", label: "Faster Turnaround", icon: <Clock className="w-6 h-6 text-gray-500" /> },
    { number: "4.9/5", label: "User Satisfaction", icon: <Star className="w-6 h-6 text-gray-500" /> }
  ];
  
  // Subtle animated background elements for a light theme
  const particles = Array.from({ length: 20 }, (_, i) => (
    <div
      key={i}
      className="absolute w-1 h-1 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full animate-pulse"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${3 + Math.random() * 5}s`
      }}
    />
  ));

  return (
    <div className="min-h-screen bg-white text-slate-800 overflow-hidden relative font-sans">
      {/* Animated Background */}

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {particles}
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: 'all 0s ease-out'
          }}
        />
      </div>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-50">
        {particles}
        <div
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transition: 'all 0.2s ease-out'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-2">
                <FileSignature className="w-8 h-8 text-purple-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  QuoteKaro
                </span>
              </div>

              <div className="hidden md:flex items-center space-x-8 text-slate-700 font-medium">
                <a href="#features" className="hover:text-purple-600 transition-colors duration-300">Features</a>
                <a href="#testimonials" className="hover:text-purple-600 transition-colors duration-300">Testimonials</a>
                <Link to="/pricing" className="hover:text-purple-600 transition-colors duration-300">Pricing</Link>
                {/* <a href="#contact" className="hover:text-purple-600 transition-colors duration-300">Contact</a> */}
              </div>
              
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/register" className="text-slate-700 font-medium hover:text-purple-600 transition-colors">Sign Up</Link>
                <Link to="/login" className="group relative bg-slate-900 text-white px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-purple-200 transform hover:scale-105 transition-all duration-300 flex items-center gap-2 font-semibold">
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                </Link>
              </div>

              <div className="md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-800">
                  {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
              </div>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-4 py-4 space-y-3 text-slate-700">
                <a href="#features" className="block py-2">Features</a>
                <a href="#testimonials" className="block py-2">Testimonials</a>
                <Link to= "/pricing" className="block py-2">Pricing</Link>
                {/* <a href="#contact" className="block py-2">Contact</a> */}
                <button className="w-full bg-slate-900 text-white px-6 py-3 rounded-full mt-2">
                  Create Your First Quote
                </button>
                <button className="w-full text-center py-2">Login</button>
              </div>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto text-center">
             <div className="inline-flex items-center gap-2 bg-purple-100/70 border border-purple-200/80 rounded-full px-4 py-2 mb-8">
                <Zap className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-purple-700 font-medium">Built for Wedding Pros & Studio Owners</span>
              </div>
              
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-slate-900">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                Professional Estimates,
              </span>
              <br />
              Instantly.
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-3xl mx-auto">
              Build beautiful quotes that impress clients and win more business — in just a few clicks. Stop wasting time, start winning with <span className='text-purple-600 font-semibold'>stunning templates</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register" 
               className="group relative w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-slate-300 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2">
                <span>Create Your First Quote</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-gray-50/80 border border-gray-200/80 rounded-xl p-5 text-center transition-all duration-300 hover:shadow-lg hover:border-gray-300">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-500 font-medium text-sm flex items-center justify-center gap-2">
                    {stat.icon}
                    <span>{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
        </section>
        
        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50/70 border-y border-gray-200/80">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                Everything You Need to <span className="text-purple-600">Win More Clients</span>
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Quote Karo provides powerful, easy-to-use tools designed to make your business look professional and operate efficiently.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div key={feature.title} className="group bg-white border border-gray-200/80 rounded-2xl p-6 hover:border-gray-300 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                   <div className="flex items-start gap-4 mb-4">
                      <div className="p-3 bg-purple-100/70 rounded-xl border border-purple-200/80">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 pt-1">{feature.title}</h3>
                   </div>
                  <p className="text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: feature.description }}></p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                Loved by Professionals Like You
              </h2>
              <p className="text-xl text-slate-600">
                Don't just take our word for it. Here's what our users are saying.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial) => (
                <div key={testimonial.name} className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-8 flex flex-col">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 italic leading-relaxed flex-grow">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center justify-center text-2xl font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{testimonial.name}</div>
                      <div className="text-purple-600 font-medium">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center bg-gradient-to-br from-purple-600 to-pink-500 rounded-2xl p-10 md:p-16 shadow-2xl shadow-purple-200/80">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Beautiful. Branded. Booked.
            </h2>
            <p className="text-xl mb-8 text-purple-100">
              Ready to transform your quoting process? <span className="font-semibold">Try now, pay later</span> with our flexible credit system. Get started for free.
            </p>
            
            <Link  to="/register">
            <button className="group relative bg-white text-purple-700 px-8 py-4 rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-white/20 transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 mx-auto">
              <span>Start Winning Clients</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}