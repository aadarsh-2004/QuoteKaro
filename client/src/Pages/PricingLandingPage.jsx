import React, { useState, useEffect } from "react";
import {
  Zap,
  Star,
  Check,
  ArrowRight,
  FileSignature,
  Crown,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async"; // <--- ADD THIS LINE FOR SEO MANAGEMENT
import LandingNavbar from "../Components/LandingNavbar";

const PricingLandingPage = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [creditPlans, setCreditPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/plans`
        );
        const allPlans = res.data;

        setSubscriptionPlans(allPlans.filter((p) => p.type === "subscription"));
        setCreditPlans(allPlans.filter((p) => p.type === "one-time"));
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch plans:", err);
        setError("Failed to load pricing plans. Please try again later.");
        toast.error("Failed to fetch plans. Please try again.");
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getPrice = (plan) => {
    return billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const getSavingsPercent = (plan) => {
    if (billingCycle === "yearly" && plan.monthlyPrice && plan.yearlyPrice) {
      const monthlyCostPerYear = plan.monthlyPrice * 12;
      return Math.round(
        ((monthlyCostPerYear - plan.yearlyPrice) / monthlyCostPerYear) * 100
      );
    }
    return 0;
  };

  // Define FAQ data for Schema Markup
  const faqData = [
    {
      question: "What is QuoteKaro's pricing model?",
      answer:
        "QuoteKaro offers flexible pricing with both monthly/yearly subscription plans and one-time credit packs, allowing you to choose what best fits your photography business needs.",
    },
    {
      question: "Do you offer a free trial or free credits?",
      answer:
        "Yes, you can sign up for free to create your first quotes and experience QuoteKaro's features. Explore our plans to see free credit allowances.",
    },
    {
      question: "Are there different plans for different types of photographers?",
      answer:
        "Our plans are designed to cater to various needs, from freelance photographers to large studios. You can choose a subscription for consistent usage or one-time credit packs for seasonal or occasional needs.",
    },
    {
      question: "How do the credits work?",
      answer:
        "Credits are used to generate estimates. With subscription plans, you get a fixed number of estimates per month. One-time credit packs allow you to purchase additional estimates as needed, without a recurring commitment.",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-8">
        <p className="text-gray-600">Loading pricing information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white ">
      {/* Helmet for Pricing Page Specific SEO */}
      <Helmet>
        <title>
          QuoteKaro Pricing | Flexible Plans & Credit Packs for Photographers
        </title>
        <meta
          name="description"
          content="Find the perfect QuoteKaro pricing plan for your photography business. Choose from flexible monthly/yearly subscriptions or one-time credit packs to generate professional estimates."
        />
        <link rel="canonical" href="https://www.quotekaro.in/pricing" />
        <meta
          name="keywords"
          content="QuoteKaro pricing, photography estimate software cost, quote generator plans, freelance photographer pricing tool, studio estimate software price, credit system for photographers, subscription plans for photography, India photography app pricing"
        />
        {/* Open Graph Tags for Social Sharing - specific to Pricing Page */}
        <meta
          property="og:title"
          content="QuoteKaro Pricing: Flexible Plans for Your Photography Business"
        />
        <meta
          property="og:description"
          content="Explore QuoteKaro's transparent pricing for photographers and studios. Choose subscription plans or one-time credit packs to get instant, professional estimates."
        />
        <meta property="og:image" content="/fullogo.png" />{" "}
        {/* IMPORTANT: Create a specific image for your pricing page and update this URL */}
        <meta property="og:url" content="https://quotekaro.in/pricing" />{" "}
        {/* IMPORTANT: Ensure this matches your actual pricing page URL */}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_IN" />
        {/* Twitter Card Tags for Social Sharing - specific to Pricing Page */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="QuoteKaro Pricing Plans: Get Started for Free"
        />
        <meta
          name="twitter:description"
          content="Discover QuoteKaro's flexible pricing for photographers. Monthly, yearly, or one-time credits – find the perfect fit for your studio or freelance work."
        />
        <meta name="twitter:image" content="/fullogo.png" />{" "}
        {/* IMPORTANT: Create a specific image for your pricing page and update this URL */}
        <meta name="twitter:site" content="https://x.com/QuoteKaro" />{" "}
        {/* OPTIONAL: Your Twitter handle */}
        {/* Schema Markup for FAQPage (JSON-LD) */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": ${JSON.stringify(faqData).replace(/</g, "\\u003c")}
            }
          `}
        </script>
        {/* Schema Markup for Product (assuming QuoteKaro is the main product offered here) */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "Product",
              "name": "QuoteKaro Estimate Software",
              "description": "QuoteKaro offers flexible plans and credit packs for photographers and studios to generate instant, professional estimates, streamline client proposals, and grow their business.",
              "url": "https://quotekaro.in/pricing",
              "brand": {
                "@type": "Brand",
                "name": "QuoteKaro"
              },
              "offers": [
                // Dynamically add offers based on your subscriptionPlans and creditPlans
                ${subscriptionPlans
                  .map(
                    (plan) => `
                  {
                    "@type": "Offer",
                    "name": "${plan.name} Monthly Plan",
                    "priceCurrency": "INR",
                    "price": "${plan.monthlyPrice}",
                    "url": "https://quotekaro.in/register", // Link to signup
                    "priceValidUntil": "${new Date(
                      new Date().setFullYear(new Date().getFullYear() + 1)
                    )
                      .toISOString()
                      .split("T")[0]}", // Valid for 1 year
                    "availability": "https://schema.org/InStock",
                    "itemCondition": "https://schema.org/NewCondition",
                    "billingDuration": "P1M" // Per month
                  }
                `
                  )
                  .join(",")},
                ${subscriptionPlans
                  .filter((plan) => plan.yearlyPrice)
                  .map(
                    (plan) => `
                  {
                    "@type": "Offer",
                    "name": "${plan.name} Yearly Plan",
                    "priceCurrency": "INR",
                    "price": "${plan.yearlyPrice}",
                    "url": "https://quotekaro.in/register", // Link to signup
                    "priceValidUntil": "${new Date(
                      new Date().setFullYear(new Date().getFullYear() + 1)
                    )
                      .toISOString()
                      .split("T")[0]}", // Valid for 1 year
                    "availability": "https://schema.org/InStock",
                    "itemCondition": "https://schema.org/NewCondition",
                    "billingDuration": "P1Y" // Per year
                  }
                `
                  )
                  .join(",")},
                ${creditPlans
                  .map(
                    (plan) => `
                  {
                    "@type": "Offer",
                    "name": "${plan.name} Credit Pack",
                    "priceCurrency": "INR",
                    "price": "${plan.monthlyPrice}", // Assuming monthlyPrice is the one-time price here
                    "url": "https://quotekaro.in/login", // Link to login to buy credits
                    "priceValidUntil": "${new Date(
                      new Date().setFullYear(new Date().getFullYear() + 1)
                    )
                      .toISOString()
                      .split("T")[0]}", // Valid for 1 year
                    "availability": "https://schema.org/InStock",
                    "itemCondition": "https://schema.org/NewCondition"
                  }
                `
                  )
                  .join(",")}
              ]
            }
          `}
        </script>
      </Helmet>
      <LandingNavbar/>
      {/* Hero Section for Pricing Page */}
      <div className="text-center mb-12 max-w-4xl mx-auto pt-12">
        {/* H1 Tag for Pricing Page */}
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          Flexible Pricing for Every Photographer
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Choose a plan that fits your business needs, from powerful monthly
          subscriptions to convenient one-time credit boosts.
        </p>
        <button
          onClick={() => {
            document
              .getElementById("subscription-plans")
              .scrollIntoView({ behavior: "smooth" });
          }}
          className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:-translate-y-1"
        >
          View Our Plans
          <ArrowRight className="ml-3 w-5 h-5" />
        </button>
      </div>
      {/* Subscription Plans Section */}
      <div id="subscription-plans" className="mb-16">
        <div className="text-center mb-12">
          {/* H2 Tag for Subscription Plans */}
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Subscription Plans for Consistent Growth
          </h2>
          <p className="text-lg text-gray-600">
            Unlock advanced features and consistent credit access to power your
            photography business.
          </p>
        </div>
        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-white/50 shadow-md">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-xl transition-all font-semibold text-lg ${
                billingCycle === "monthly"
                  ? "bg-purple-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-xl transition-all font-semibold text-lg ${
                billingCycle === "yearly"
                  ? "bg-purple-500 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Yearly
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                Save {getSavingsPercent(subscriptionPlans.find((p) => p.isPopular)) || "20"}%
              </span>
            </button>
          </div>
        </div>
        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan._id}
              className={`relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border-2 transition-all hover:scale-[1.02] ${
                plan.isPopular
                  ? "border-purple-400 ring-4 ring-purple-100"
                  : "border-gray-200"
              } p-8 flex flex-col`} // Added flex flex-col here
            >
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Most Popular
                  </div>
                </div>
              )}

              <div
                className={`w-16 h-16 bg-gradient-to-br ${
                  plan.color || "from-blue-500 to-cyan-500"
                } rounded-2xl flex items-center justify-center mb-6`}
              >
                <Crown className="w-8 h-8 text-white" />
              </div>

              <h3 className="text-3xl font-bold text-gray-900 mb-3">
                {plan.name}
              </h3>
              <p className="text-gray-600 mb-6 flex-grow">{plan.description}</p>

              <div className="mb-8">
                <span className="text-4xl font-extrabold text-gray-900">
                  ₹{getPrice(plan)}
                </span>
                <span className="text-xl text-gray-600">
                  /{billingCycle === "monthly" ? "month" : "year"}
                </span>
                {billingCycle === "yearly" && getSavingsPercent(plan) > 0 && (
                  <div className="text-base text-green-600 font-semibold mt-1">
                    Save {getSavingsPercent(plan)}% annually
                  </div>
                )}
              </div>

              {/* This div should also flex-grow to push the button to the bottom */}
              <div className="flex-grow mb-8">
                <div className="flex items-center gap-2 mb-4 text-purple-700">
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold text-lg">
                    {plan.credits} estimates/month
                  </span>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => navigate("/login")}
                className="w-full py-4 rounded-2xl font-semibold text-lg transition-all flex items-center justify-center gap-2 group bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl transform hover:-translate-y-1"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Credit Plans Section */}
      <div id="credit-plans" className="mb-16">
        {" "}
        {/* Added an ID for scrolling/linking if needed */}
        <div className="text-center mb-12">
          {/* H2 Tag for Credit Plans */}
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            One-Time Credit Packs for Flexibility
          </h2>
          <p className="text-lg text-gray-600">
            Need a few extra estimates or prefer a pay-as-you-go model?
            Purchase credits as you go.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {creditPlans.map((pkg) => (
            <div
              key={pkg._id}
              className={`relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border-2 transition-all hover:scale-[1.02] ${
                pkg.isPopular
                  ? "border-purple-400 ring-4 ring-purple-100"
                  : "border-gray-200"
              } p-6 text-center flex flex-col`} // Added flex flex-col here
            >
              {pkg.isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Best Value
                  </div>
                </div>
              )}

              <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Zap className="w-7 h-7 text-white" />
              </div>

              <div className="mb-4 flex-grow">
                {" "}
                {/* Made this flex-grow */}
                <span className="text-2xl font-bold text-gray-900">
                  {pkg.credits} Credits
                </span>
                {pkg.bonusCredits > 0 && (
                  <div className="text-base text-green-600 font-semibold mt-1">
                    +{pkg.bonusCredits} bonus credits
                  </div>
                )}
              </div>

              <div className="text-3xl font-bold text-purple-700 mb-6">
                ₹{pkg.monthlyPrice}{" "}
                {/* Assuming monthlyPrice is the one-time price */}
              </div>

              <button
                onClick={() => navigate("/login")}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Call to Action / Footer Section */}
      <div className="text-center py-16 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 max-w-4xl mx-auto mt-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Ready to Grow Your Photography Business?
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Join thousands of photographers and studios streamlining their
          estimates with QuoteKaro.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:-translate-y-1"
        >
          Sign Up for Free
          <ArrowRight className="ml-3 w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PricingLandingPage;