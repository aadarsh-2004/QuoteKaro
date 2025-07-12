import React, { useState } from "react";
import { auth } from "../../firebase";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, FileSignature, EyeOff, ArrowRight, Sparkles, Camera, User } from 'lucide-react';
import { Helmet } from 'react-helmet-async'; // <--- ADD THIS LINE FOR SEO MANAGEMENT

import {
  createUserWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const Register = () => {
  const [studioName, setStudioName] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!studioName || !email || !password) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await updateProfile(user, {
        displayName: studioName,
      });
      const firebaseUID = user.uid;

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/register`,
        {
          firebaseUID,
          studioName,
          email,
        }
      );
      console.log("✅ Registered");
      navigate("/login");
      
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong during registration.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await setPersistence(auth, browserLocalPersistence);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const firebaseUID = user.uid;
      const email = user.email;
      const studioName = user.displayName || "My Studio";
      
      // Send to backend
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/register`,
        {
          firebaseUID,
          studioName,
          email,
        }
      );
      console.log("✅ Signed up with Google!");
      navigate("/dashboard"); // Navigate to dashboard after successful Google register
    } catch (err) {
      console.error(err);
      setError("Google sign-up failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Helmet for Register Page Specific SEO */}
      <Helmet>
        <title>Register | QuoteKaro - Create Your Free Account</title>
        <meta
          name="description"
          content="Sign up for QuoteKaro and start creating instant, professional estimates for your photography business. Free registration for freelancers and studios."
        />
        <link rel="canonical" href="https://www.quotekaro.in/register" />
        <meta
          name="keywords"
          content="QuoteKaro register, create account, free signup, photography estimate software, studio registration, freelance photographer signup, get started with QuoteKaro"
        />
        {/* Open Graph Tags for Social Sharing - specific to Register Page */}
        <meta property="og:title" content="Register for QuoteKaro: Start Your Free Trial Today" />
        <meta property="og:description" content="Join QuoteKaro! Easily create stunning, professional estimates for your photography clients. Register now for free." />
        <meta property="og:image" content="https://quotekaro.in/og-image-register.jpg" /> {/* IMPORTANT: Create a specific image for your register page and update this URL */}
        <meta property="og:url" content="https://quotekaro.in/register" /> {/* IMPORTANT: Ensure this matches your actual register page URL */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card Tags for Social Sharing - specific to Register Page */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sign Up for QuoteKaro - Free Estimate Software" />
        <meta name="twitter:description" content="Revolutionize your quoting process. Register for QuoteKaro and get instant, professional estimates for your photography studio." />
        <meta name="twitter:image" content="https://quotekaro.in/twitter-image-register.jpg" /> {/* IMPORTANT: Create a specific image for your register page and update this URL */}
        <meta name="twitter:site" content="@yourtwitterhandle" /> {/* OPTIONAL: Your Twitter handle */}
      </Helmet>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-300 to-purple-200 rounded-full opacity-10 blur-2xl animate-pulse delay-500"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>
      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg mb-4 transform rotate-12 hover:rotate-0 transition-transform duration-300">
            {/* <FileSignature className="w-8 h-8 text-white" /> */}
            <img className="w-16 h-16 text-white " src="/logo.png" alt="logo" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            QuoteKaro
          </h1>
          <p className="text-gray-500 text-sm">
            <span className="font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">Create Account </span>
            to start your creative journey
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 space-y-6">
          {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Studio Name Input */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Studio Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors w-5 h-5" />
                <input
                  type="text"
                  placeholder="Enter your studio name"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-300 group-focus-within:bg-white"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors w-5 h-5" />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-300 group-focus-within:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="relative group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-purple-300 group-focus-within:bg-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mt-0.5"
                required
              />
              <label htmlFor="terms" className="text-gray-600 font-medium leading-relaxed">
                I agree to the{" "}
                <Link
                  to="/terms-conditions" // Corrected path to terms-conditions
                  className="text-purple-600 hover:text-pink-600 font-semibold transition-colors"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy-policy" // Corrected path to privacy-policy
                  className="text-purple-600 hover:text-pink-600 font-semibold transition-colors"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating your account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative bg-white px-4 text-sm text-gray-500">
              or sign up with
            </div>
          </div>

          {/* Google Sign Up */}
          <button
            onClick={handleGoogleRegister}
            className="w-full flex items-center justify-center gap-3 py-4 border-2 border-gray-200 rounded-2xl hover:border-purple-300 hover:bg-purple-50/30 transition-all transform hover:scale-105 group"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-semibold text-gray-700 group-hover:text-purple-700 transition-colors">
              Sign up with Google
            </span>
          </button>

          {/* Sign In Link */}
          <div className="text-center pt-4">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:from-pink-600 hover:to-purple-600 transition-all"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Crafted with passion for photographers</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <Link to="/privacy-policy" className="hover:text-purple-600 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms-conditions" className="hover:text-purple-600 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/return-refund-policy" className="hover:text-purple-600 transition-colors">Return Refund Policy</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
