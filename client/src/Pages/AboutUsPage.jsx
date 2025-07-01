import React from 'react';
import { Users,FileSignature  } from 'lucide-react';
import { Helmet } from 'react-helmet-async'; // <--- ADD THIS LINE
import Footer from './Footer'; // Assuming you have a Footer component
import { Link } from 'react-router-dom';
const Section = ({ title, children }) => (
  <div className="mb-8">
    {/* Use H2 for sections within the About Us page */}
    <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
    <div className="text-gray-700 leading-relaxed space-y-4">
      {children}
    </div>
  </div>
);

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col"> {/* Added flex-col for footer push */}
      {/* Helmet for About Us Page Specific SEO */}
      <Helmet>
        <title>About QuoteKaro | Our Mission to Empower Photographers</title>
        <meta
          name="description"
          content="Learn about QuoteKaro, a SaaS platform simplifying quote and estimate creation for photographers and creative professionals in India and globally. Discover our mission, values, and team."
        />
        <meta
          name="keywords"
          content="About QuoteKaro, QuoteKaro mission, photography SaaS, estimate software company, India tech startup, creative professionals software, online quoting tool, QuoteKaro team, contact QuoteKaro"
        />
        {/* Open Graph Tags for Social Sharing - specific to About Us Page */}
        <meta property="og:title" content="About QuoteKaro: Simplifying Estimates for Creatives" />
        <meta property="og:description" content="Discover QuoteKaro's journey to build the easiest and most powerful estimate generation platform for photographers and studios worldwide. Meet our team." />
        <meta property="og:image" content="https://quotekaro.in/og-image-about.jpg" /> {/* IMPORTANT: Create a specific image for your About Us page and update this URL */}
        <meta property="og:url" content="https://quotekaro.in/about-us" /> {/* IMPORTANT: Ensure this matches your actual About Us page URL */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_IN" />

        {/* Twitter Card Tags for Social Sharing - specific to About Us Page */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Our Story: About QuoteKaro" />
        <meta name="twitter:description" content="Learn about QuoteKaro's mission to empower photographers and studios with intuitive, professional estimate tools. Based in India, serving globally." />
        <meta name="twitter:image" content="https://quotekaro.in/twitter-image-about.jpg" /> {/* IMPORTANT: Create a specific image for your About Us page and update this URL */}
        <meta name="twitter:site" content="@yourtwitterhandle" /> {/* OPTIONAL: Your Twitter handle */}

        {/* Schema Markup for Organization and AboutPage (JSON-LD) */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": "QuoteKaro",
                  "url": "https://quotekaro.in",
                  "logo": "https://quotekaro.in/logo.png", // IMPORTANT: Update with your actual logo URL
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "telephone": "+91-7877571101",
                    "contactType": "customer service",
                    "email": "quotekaro.official@gmail.com"
                  },
                  "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "3v/1 Prabhat Nagar",
                    "addressLocality": "Udaipur",
                    "addressRegion": "Rajasthan",
                    "postalCode": "313001", // Assuming a postal code for Udaipur
                    "addressCountry": "IN"
                  },
                  "sameAs": [
                    // Add your social media profiles here if available
                    "https://www.facebook.com/yourquotekaropage",
                    "https://twitter.com/yourtwitterhandle",
                    "https://www.linkedin.com/company/yourquotekarocompany"
                  ]
                },
                {
                  "@type": "AboutPage",
                  "name": "About QuoteKaro",
                  "url": "https://quotekaro.in/about-us",
                  "description": "Learn about QuoteKaro, a SaaS platform simplifying quote and estimate creation for photographers and creative professionals in India and globally.",
                  "mainEntity": {
                    "@type": "WebPageElement",
                    "name": "Our Mission",
                    "description": "Our mission is to democratize access to streamlined quoting tools by combining simplicity, personalization, and smart automation."
                  },
                  "publisher": {
                    "@id": "https://quotekaro.in/#organization"
                  }
                }
              ]
            }
          `}
        </script>
      </Helmet>
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-2">
              <FileSignature className="w-8 h-8 text-purple-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                QuoteKaro
              </span>
            </Link>
            <div className="hidden md:flex items-center space-x-8 text-slate-700 font-medium">
              <Link to="/" className="hover:text-purple-600 transition-colors duration-300">Home</Link>
              <Link to="/features" className="hover:text-purple-600 transition-colors duration-300">Features</Link>
              <Link to="/pricing" className="hover:text-purple-600 transition-colors duration-300">Pricing</Link>
              <Link to="/about-us" className="hover:text-purple-600 transition-colors duration-300">About Us</Link>
              <Link to="/login" className="px-5 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors duration-200">Log In</Link>
              <Link to="/register" className="px-5 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200">Sign Up Free</Link>
            </div>
            {/* Mobile menu toggle would go here if needed, similar to LandingPage */}
          </div>
        </div>
      </header>
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-purple-600 mr-3" /> {/* Changed icon color for consistency */}
            {/* Main heading for the About Us page */}
            <h1 className="text-3xl font-bold text-gray-900">About QuoteKaro</h1> {/* Corrected typo */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 flex-grow"> {/* Added flex-grow to push footer */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <Section title="Who We Are">
            <p><strong>QuoteKaro</strong> is a next-generation SaaS platform built to simplify quote and estimate creation for creative professionals, freelancers, and businesses in the photography industry.</p> {/* Corrected typo and refined text */}
            <p>Whether you're a wedding photographer, a product studio, an event manager, or any service provider — we empower you to generate professional, branded estimates effortlessly and efficiently.</p> {/* Refined text */}
          </Section>

          <Section title="Our Mission">
            <p>Our mission is to democratize access to streamlined quoting tools by combining simplicity, personalization, and smart automation.</p>
            <p>We believe every photographer and creative business deserves a fast, beautiful, and accurate quoting experience without the complexity of manual spreadsheets or expensive, cumbersome tools.</p> {/* Refined text for target audience */}
          </Section>

          <Section title="What We Offer">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>🧾 Create fully customized estimates in minutes</li>
              <li>🎨 Use professionally designed themes that reflect your brand</li>
              <li>📥 Generate and share secure PDFs instantly or via a client-friendly online portal</li> {/* Refined text */}
              <li>📊 Track credits, usage analytics, and client interactions (Coming Soon!)</li> {/* Refined text, added (Coming Soon!) */}
              <li>🔐 Hosted securely with robust data protection, regular backups & SSL encryption</li> {/* Refined text */}
            </ul>
          </Section>

          <Section title="Why Photographers & Creators Love Us"> {/* Refined title */}
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Speed:</strong> Drag, drop, and send polished quotes in seconds</li>
              <li><strong>Design:</strong> Elegant, clean templates that truly impress clients</li> {/* Refined text */}
              <li><strong>Control:</strong> Easily manage your plans, credits, and service lists</li>
              <li><strong>Support:</strong> Friendly human help whenever you need it</li>
            </ul>
          </Section>

          <Section title="Meet the Makers">
            <p>QuoteKaro is founded by passionate engineers and creators who intimately understand the day-to-day struggles of running a service business. We’re building QuoteKaro to solve real problems we’ve faced ourselves, striving to make your business operations smoother.</p> {/* Corrected typo and refined text */}
          </Section>

          <Section title="Built in India, Loved Globally">
            <p>We are proudly based in India 🇮🇳, and we serve businesses and creatives across the world. From local vendors to international studios — our tools scale with your ambitions, providing a seamless experience wherever you are.</p> {/* Refined text */}
          </Section>

          <Section title="Let’s Connect">
            <p>We love talking to our users and growing with your feedback. Reach out to us:</p> {/* Refined introductory sentence */}
            <p>Email: <strong>quotekaro.official@gmail.com</strong><br />
              Phone: <strong>+91 7877571101</strong><br />
              Address: <em>3v/1 Prabhat Nagar, Udaipur, Rajasthan, India </em><br />
              Hours: Monday – Friday, 9:00 AM – 6:00 PM IST
            </p>
          </Section>
        </div>
      </div>
      <Footer /> {/* <--- ADDED FOOTER HERE */}
    </div>
  );
};

export default AboutUsPage;
