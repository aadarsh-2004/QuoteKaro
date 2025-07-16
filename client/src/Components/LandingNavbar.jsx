
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
import { auth } from "../../firebase";
import { useNavigate , Link  } from "react-router-dom";

function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);


 
  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-2">
                <Link to="/">
                <img src="/bgremovelogo.png" alt="logo" className='w-48 h-48' />
                </Link>
              </div>

              <div className="hidden md:flex items-center space-x-8 text-slate-700 font-medium">
                {/* Changed to Link for React Router handling */}
                <Link to="/features" className="hover:text-purple-600 transition-colors duration-300">Features</Link> 
                <Link to="/about-us" className="hover:text-purple-600 transition-colors duration-300">About Us</Link>
                <Link to="/pricing" className="hover:text-purple-600 transition-colors duration-300">Pricing</Link>
                <Link to="/blog" className="hover:text-purple-600 transition-colors duration-300">Blog</Link> {/* Assuming a blog route */}
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
                <Link to="/features" onClick={() => setIsMenuOpen(false)} className="block py-2">Features</Link>
                <Link to="/about-us" onClick={() => setIsMenuOpen(false)} className="block py-2">About Us</Link>
                <Link to="/pricing" onClick={() => setIsMenuOpen(false)} className="block py-2">Pricing</Link>
                <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="block py-2">Blog</Link> {/* Assuming a blog route */}
                {/* <a href="#contact" className="block py-2">Contact</a> */}
                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="w-full bg-slate-900 text-white px-6 py-3 rounded-full mt-2 text-center block">
                  Create Your First Quote
                </Link>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="w-full text-center py-2 block">Login</Link>
              </div>
            </div>
          )}
        </nav>
  );
}

export default LandingNavbar;
