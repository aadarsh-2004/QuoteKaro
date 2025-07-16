import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // For SEO management
import Footer from './Footer'; // Assuming you have a Footer component
import {
  LayoutTemplate,
  Wallet2,
  Settings,
  FileText,
  BadgeCheck,
  BarChart3,
  CalendarCheck, // New icon for event tracking
  Sparkles,
  ArrowRight,
  CheckCircle ,
  FileSignature
} from 'lucide-react';
import LandingNavbar from '../Components/LandingNavbar';

const FeaturesPage = () => {
  const features = [
    {
      icon: <LayoutTemplate className="w-10 h-10 text-purple-600" />,
      title: "Theme-Based Quotation Templates",
      description: "Choose from a library of professionally designed, stunning templates tailored specifically for the photography industry. Present your services beautifully and consistently, making every estimate a visual masterpiece.",
      benefits: [
        "Professional & Modern Designs",
        "Industry-Specific Layouts",
        "Consistent Branding Across Quotes"
      ],
      link: "/register",
      linkText: "Explore Templates"
    },
    {
      icon: <Wallet2 className="w-10 h-10 text-purple-600" />,
      title: "Smart Credit System",
      description: "A flexible, pay-per-estimate model using credits, perfect for seasonal businesses or freelancers. Buy credits as needed, ensuring you only pay for what you use, without rigid monthly commitments.",
      benefits: [
        "Cost-Effective for Seasonal Work",
        "No Long-Term Contracts",
        "Flexible Credit Purchases"
      ],
      link: "/pricing",
      linkText: "View Credit Plans"
    },
    {
      icon: <Settings className="w-10 h-10 text-purple-600" />,
      title: "Customizable Services & Pricing",
      description: "Personalize your service list, create custom packages, add specific terms and conditions, and adjust pricing on the fly. Your offering is fully customizable to fit every client's unique needs.",
      benefits: [
        "Tailor Services to Clients",
        "Dynamic Pricing Adjustments",
        "Pre-save Common Terms & Conditions"
      ],
      link: "/register",
      linkText: "Customize Your Offerings"
    },
    {
      icon: <FileText className="w-10 h-10 text-purple-600" />,
      title: "Secure PDF Generation & Sharing",
      description: "Instantly generate high-quality, professional PDFs of your estimates. Share them securely via unique links or directly through email, all managed conveniently from your QuoteKaro dashboard.",
      benefits: [
        "High-Quality PDF Exports",
        "Secure Client Links",
        "Integrated Email Sharing"
      ],
      link: "/login",
      linkText: "Generate Your First PDF"
    },
    {
      icon: <BadgeCheck className="w-10 h-10 text-purple-600" />,
      title: "Studio Profile & Branding",
      description: "Elevate your brand by adding your logo, contact details, and a personalized message to every quote. Make your brand stand out and reinforce your professional identity with every client interaction.",
      benefits: [
        "Upload Custom Logo",
        "Personalized Branding",
        "Consistent Brand Presence"
      ],
      link: "/register",
      linkText: "Brand Your Quotes"
    },
    {
      icon: <BarChart3 className="w-10 h-10 text-purple-600" />,
      title: "Dashboard & Insights",
      description: "Gain valuable insights into your business performance. Track estimate views, client engagement, and lead conversion rates with simple, intuitive analytics to help you grow your business. (Coming Soon)",
      benefits: [
        "Track Estimate Performance",
        "Monitor Client Engagement",
        "Identify Conversion Trends"
      ],
      link: "#", // No specific link as it's coming soon
      linkText: "View Dashboard (Coming Soon)"
    },
    {
      icon: <CalendarCheck className="w-10 h-10 text-purple-600" />, // New icon
      title: "Upcoming Event Tracking & Management", // New feature
      description: "Seamlessly track and manage all your upcoming events and bookings directly linked to your sent estimates. Stay organized, never miss a deadline, and ensure smooth project delivery.",
      benefits: [
        "Automated Event Calendar",
        "Link Estimates to Events",
        "Deadline Reminders & Notifications"
      ],
      link: "/dashboard", // Assuming this would be part of the dashboard
      linkText: "Manage Your Events"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col">
      {/* Helmet for Features Page SEO */}
      <Helmet>
        <title>QuoteKaro Features | Powerful Tools for Photographers & Studios</title>
        <meta
          name="description"
          content="Explore QuoteKaro's powerful features: instant quotation templates, smart credit system, customizable pricing, secure PDF sharing, branding tools, and upcoming event tracking for photographers."
        />
        <meta
          name="keywords"
          content="QuoteKaro features, photography estimate tools, client proposal software, online quoting system, photography business features, smart credit system, customizable pricing, PDF generation, studio branding, event tracking, client management"
        />
        <link rel="canonical" href="https://www.quotekaro.in/features" />
        
        {/* Open Graph Tags for Social Sharing */}
        <meta property="og:title" content="QuoteKaro Features: Streamline Your Photography Business" />
        <meta property="og:description" content="Discover how QuoteKaro's innovative features like instant estimates, flexible credits, and event tracking empower photographers and studios to win more clients." />
        <meta property="og:image" content="/fullogo.png" /> {/* Replace with a suitable features page image */}
        <meta property="og:url" content="https://quotekaro.in/features" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card Tags for Social Sharing */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="QuoteKaro Features: The Future of Photography Estimates" />
        <meta name="twitter:description" content="Unlock efficiency with QuoteKaro's powerful tools for photographers: beautiful templates, smart credits, and seamless event management." />
        <meta name="twitter:image" content="https://quotekaro.in/twitter-image-features.jpg" /> {/* Replace with a suitable features page image */}
        <meta name="twitter:site" content="@yourtwitterhandle" /> {/* OPTIONAL: Your Twitter handle */}

        {/* Schema Markup for Product Features (JSON-LD) */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "QuoteKaro",
              "description": "QuoteKaro is a SaaS platform providing instant, professional estimate generation, client proposal tools, and business management features for photographers and studios.",
              "url": "https://quotekaro.in/features",
              "brand": {
                "@type": "Brand",
                "name": "QuoteKaro"
              },
              "image": "/fullogo.png", // Use a general product image
              "featureList": [
                "Theme-Based Quotation Templates",
                "Smart Credit System",
                "Customizable Services & Pricing",
                "Secure PDF Generation & Sharing",
                "Studio Profile & Branding",
                "Dashboard & Insights",
                "Upcoming Event Tracking & Management"
              ]
            }
          `}
        </script>
      </Helmet>

      <LandingNavbar/>
      

      {/* Hero Section for Features Page */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-3xl mx-auto">
          <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-4 leading-tight">
            Unlock Your Studio's Full Potential
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Discover the powerful features of QuoteKaro designed to streamline your workflow, impress clients, and grow your photography business.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            Start Your Free Trial
            <ArrowRight className="ml-3 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Core Features Designed for Photographers
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            From seamless estimate creation to insightful analytics and event management, QuoteKaro has you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col items-start text-left transform transition-transform hover:scale-[1.02] duration-300">
              <div className="p-4 bg-purple-100/70 rounded-xl border border-purple-200/80 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-slate-600 mb-6 flex-grow">
                {feature.description}
              </p>
              <ul className="list-none space-y-2 mb-6 w-full">
                {feature.benefits.map((benefit, bIndex) => (
                  <li key={bIndex} className="flex items-center text-slate-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              {feature.link && (
                <Link
                  to={feature.link}
                  className="inline-flex items-center text-purple-600 font-semibold hover:text-pink-600 transition-colors group mt-auto"
                >
                  {feature.linkText}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-purple-700 text-white py-20 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Photography Business?
          </h2>
          <p className="text-xl max-w-2xl mx-auto mb-10">
            Experience the power of QuoteKaro's features firsthand. Sign up today and start creating professional estimates in minutes.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-10 py-5 bg-white text-purple-700 font-semibold rounded-xl shadow-xl hover:bg-gray-100 transition-transform transform hover:scale-105 duration-300 group"
          >
            Get Started Free Today
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FeaturesPage;
