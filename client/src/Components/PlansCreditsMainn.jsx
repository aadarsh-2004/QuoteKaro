import React, { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Zap,
  Star,
  Check,
  ArrowRight,
  TrendingUp,
  Calendar,
  Download,
  Mail,
  Phone,
  FileText,
  Crown,
  Sparkles,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import WelcomeSection from "./WelcomeSection";
import { useUser } from "../context/UserContext";
import { toast } from "react-hot-toast"; // Don't forget to import toast

const PlansCreditsMainn = () => {
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [activeTab, setActiveTab] = useState("plans");
  const [subscriptionPlans, setSubscriptionPlans] = useState([]);
  const [creditPlans, setCreditPlans] = useState([]);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false); // New state to track Razorpay script

  const { userData, loading, refresh } = useUser();

  // Effect to load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => {
        setRazorpayLoaded(true); // Set state to true when script is loaded
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay SDK script.");
        toast.error("Failed to load payment gateway. Please refresh.");
      };
      document.body.appendChild(script);
    };

    if (!window.Razorpay) { // Only load if not already present
      loadRazorpayScript();
    } else {
      setRazorpayLoaded(true); // If already present (e.g., component re-mounts)
    }

    // Cleanup function (optional, but good practice if needed for unmounting)
    // return () => {
    //   if (script && document.body.contains(script)) {
    //     document.body.removeChild(script);
    //   }
    // };
  }, []); // Run once on component mount

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/plans`
        );
        const allPlans = res.data;

        setSubscriptionPlans(allPlans.filter((p) => p.type === "subscription"));
        setCreditPlans(allPlans.filter((p) => p.type === "one-time"));
      } catch (err) {
        console.error("Failed to fetch plans:", err);
        toast.error("Failed to fetch plans. Please try again.");
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

  if (loading || !userData) {
    return (
      <div className="flex-1 p-4 md:p-8 flex items-center justify-center text-gray-600">
        Loading user data and plans...
      </div>
    );
  }

  const USER = userData;

  const usageStats = [
    {
      label: "Estimates Created",
      value: USER.total_estimates || 0,
      icon: FileText,
      color: "text-blue-600",
    },
    { label: "Clients Served", value: USER.total_clients || 0, icon: Mail, color: "text-green-600" },
    {
      label: "Revenue Generated",
      value: USER.totalturnover ? `₹${USER.totalturnover.toFixed(2)}` : "₹0.00", // Fixed currency symbol
      icon: TrendingUp,
      color: "text-purple-600",
    },
    {
      label: "Conversion Rate",
      value: USER.conversion_rate ? `${USER.conversion_rate}%` : "0%",
      icon: BarChart3,
      color: "text-pink-600",
    },
  ];

  const handleBuy = async (planDetails) => {
    if (!razorpayLoaded) {
      toast.error("Payment gateway not loaded yet. Please wait a moment.");
      return;
    }

    if (!USER._id) {
      toast.error("User not logged in. Please log in to make a purchase.");
      return;
    }

    const userId = USER._id;
    const amountInPaise = Math.round(planDetails.amount * 100);

    try {
      const orderRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/create-order`,
        {
          amount: amountInPaise,
          userId,
          purpose: planDetails.type,
          planName: planDetails.name,
          billingCycle: planDetails.cycle,
        }
      );

      const { order } = orderRes.data;

      // Ensure window.Razorpay exists before using it
      if (!window.Razorpay) {
        toast.error("Razorpay script is not available. Please try again.");
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "QuoteKaro",
        description: `Purchase: ${planDetails.name}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/payments/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              userId: userId,
              planId: planDetails._id,
              type: planDetails.type,
              purchasedAmount: planDetails.amount,
              credits: planDetails.credits,
              planName: planDetails.name,
              billingCycle: planDetails.cycle,
            });

            if (verifyRes.data.success) {
                toast.success("Payment successful ✅ and plan updated!");
                refresh();
            } else {
                toast.error("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Error during payment verification:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
            name: USER.name,
            email: USER.email,
            contact: USER.phone, // Use USER.phone as per your model
        },
        theme: { color: "#7c3aed" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Error creating Razorpay order:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else {
        toast.error("Failed to initiate payment. Please try again.");
      }
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto z-0">
      <WelcomeSection name="Plan-Credits" />

      {/* Current Plan Overview */}
      <div className="bg-white/80 backdrop-blur-xl z-10 md:z-20 relative rounded-3xl shadow-xl border border-white/50 p-4 sm:p-6 md:p-8 mb-8"> {/* Adjusted padding */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6"> {/* Added flex-col for small screens */}
          <div className="mb-4 sm:mb-0"> {/* Added margin bottom for stacking */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2"> {/* Adjusted text size */}
              Current Plan
            </h2>
            <div className="flex items-center gap-3">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="text-lg font-semibold text-purple-600">
                {USER.plan || "N/A"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  USER.isSuspended === false
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {USER.isSuspended === false ? "active" : "inactive"}
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("plans")}
            className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-lg transition-all text-sm sm:text-base" 
          >
            <RefreshCw className="w-4 h-4" />
            Upgrade Plan
          </button>
        </div>

        {/* Responsive grid for plan details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"> {/* Adjusted gap and removed unnecessary lg:grid-cols-3 */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 sm:p-6 text-white"> {/* Adjusted padding */}
            <div className="flex items-center justify-between mb-4">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8" /> {/* Adjusted icon size */}
              <span className="text-xs sm:text-sm opacity-90">Credits</span> {/* Adjusted text size */}
            </div>
            <div className="mb-2">
              <span className="text-2xl sm:text-3xl font-bold">{USER.used_credits || 0}</span> {/* Adjusted text size */}
              <span className="text-base sm:text-lg opacity-90">/{USER.total_credits || 0}</span> {/* Adjusted text size */}
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mb-2">
              <div
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{
                  width: `${USER.total_credits > 0 ? (USER.used_credits / USER.total_credits) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <span className="text-xs sm:text-sm opacity-90"> {/* Adjusted text size */}
              {(USER.total_credits - USER.used_credits) || 0} credits remaining
            </span>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-6"> {/* Adjusted padding */}
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" /> {/* Adjusted icon size */}
              <span className="text-xs sm:text-sm text-gray-500">Next Billing</span> {/* Adjusted text size */}
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-2"> {/* Adjusted text size */}
              {USER.planExpiresAt
                ? new Date(USER.planExpiresAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"}
            </div>
            <div className="text-xs sm:text-sm text-gray-600"> {/* Adjusted text size */}
              {USER.planExpiresAt ? "Auto-renewal enabled" : "No active plan"}
            </div>
          </div>

          <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 sm:p-6"> {/* Adjusted padding */}
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" /> {/* Adjusted icon size */}
              <span className="text-xs sm:text-sm text-gray-500">This Month</span> {/* Adjusted text size */}
            </div>
            <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-2"> {/* Adjusted text size */}
              {USER.total_estimates || 0}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Estimates created</div> {/* Adjusted text size */}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap bg-white/80 backdrop-blur-xl rounded-2xl p-2 mb-8 border border-white/50"> {/* Added flex-wrap for tabs */}
        {[
          { id: "plans", label: "Subscription Plans", icon: Star },
          { id: "credits", label: "Buy Credits", icon: Zap },
          { id: "usage", label: "Usage Analytics", icon: BarChart3 },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2 sm:py-3 px-2 sm:px-4 rounded-xl transition-all text-sm sm:text-base ${ /* Adjusted padding and font sizes */
                activeTab === tab.id
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" /> {/* Adjusted icon size */}
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "plans" && (
        <div>
          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-1.5 sm:p-2 border border-white/50 flex-wrap"> {/* Adjusted padding and added flex-wrap */}
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 sm:px-6 sm:py-2 rounded-xl transition-all text-sm sm:text-base ${ /* Adjusted padding and font size */
                  billingCycle === "monthly"
                    ? "bg-purple-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 sm:px-6 sm:py-2 rounded-xl transition-all text-sm sm:text-base ${ /* Adjusted padding and font size */
                  billingCycle === "yearly"
                    ? "bg-purple-500 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Yearly
                <span className="ml-1 sm:ml-2 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-green-100 text-green-700 rounded-full text-xs"> {/* Adjusted padding and font size */}
                  Save {getSavingsPercent(subscriptionPlans.find(p => p.isPopular)) || "20"}%
                </span>
              </button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8"> {/* Adjusted grid for mobile (col-1 default) */}
            {subscriptionPlans.map((plan) => (
              <div
                key={plan._id}
                className={`relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 transition-all hover:scale-105 ${
                  plan.isPopular
                    ? "border-purple-300 ring-4 ring-purple-100"
                    : "border-white/50"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1"> {/* Adjusted padding */}
                      <Star className="w-3 h-3 sm:w-4 sm:h-4" /> {/* Adjusted icon size */}
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-8"> {/* Adjusted padding */}
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${ /* Adjusted icon container size */
                      plan.color || "from-blue-500 to-cyan-500"
                    } rounded-2xl flex items-center justify-center mb-4 sm:mb-6`} 
                  >
                    <Crown className="w-7 h-7 sm:w-8 sm:h-8 text-white" /> {/* Adjusted icon size */}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2"> {/* Adjusted text size */}
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 sm:mb-6">{plan.description}</p> {/* Adjusted text size and margin */}

                  <div className="mb-6">
                    <span className="text-3xl sm:text-4xl font-bold text-gray-800"> {/* Adjusted text size */}
                      ₹{getPrice(plan)}
                    </span>
                    <span className="text-sm sm:text-base text-gray-600"> {/* Adjusted text size */}
                      /{billingCycle === "monthly" ? "month" : "year"}
                    </span>
                    {billingCycle === "yearly" &&
                      getSavingsPercent(plan) > 0 && (
                        <div className="text-xs sm:text-sm text-green-600 font-medium"> {/* Adjusted text size */}
                          Save {getSavingsPercent(plan)}% annually
                        </div>
                      )}
                  </div>

                  <div className="mb-6 sm:mb-8"> {/* Adjusted margin */}
                    <div className="flex items-center gap-2 mb-3"> {/* Adjusted margin */}
                      <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" /> {/* Adjusted icon size */}
                      <span className="font-semibold text-sm sm:text-base"> {/* Adjusted text size */}
                        {plan.credits} estimates/month
                      </span>
                    </div>

                    <ul className="space-y-2 sm:space-y-3"> {/* Adjusted spacing */}
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 sm:gap-3"> {/* Adjusted spacing */}
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" /> {/* Adjusted icon size */}
                          <span className="text-gray-700 text-sm sm:text-base">{feature}</span> {/* Adjusted text size */}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() =>
                      handleBuy({
                        _id: plan._id,
                        name: plan.name,
                        amount: getPrice(plan),
                        credits: plan.credits,
                        type: "subscription",
                        cycle: billingCycle,
                      })
                    }
                    className={`w-full py-3 sm:py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 group text-sm sm:text-base ${ /* Adjusted padding and text size */
                      USER.plan === plan.name && USER.billingCycle === billingCycle
                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg"
                    }`}
                    disabled={USER.plan === plan.name && USER.billingCycle === billingCycle || !razorpayLoaded}
                  >
                    {USER.plan === plan.name && USER.billingCycle === billingCycle ? "Current Plan" : "Choose Plan"}
                    {!(USER.plan === plan.name && USER.billingCycle === billingCycle) && (
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" /> 
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "credits" && (
        <div>
          <div className="text-center mb-6 sm:mb-8"> {/* Adjusted margin */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2"> {/* Adjusted text size */}
              Buy Additional Credits
            </h2>
            <p className="text-gray-600 text-sm"> {/* Adjusted text size */}
              Top up your account when you need extra estimates
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> {/* Adjusted grid for mobile */}
            {creditPlans.map((pkg) => (
              <div
                key={pkg._id}
                className={`relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border-2 transition-all hover:scale-105 ${
                  pkg.isPopular
                    ? "border-purple-300 ring-4 ring-purple-100"
                    : "border-white/50"
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2.5 py-1 rounded-full text-xs font-semibold"> {/* Adjusted padding and text size */}
                      Best Value
                    </div>
                  </div>
                )}

                <div className="p-6 text-center"> {/* Adjusted padding */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4"> {/* Adjusted size and margin */}
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" /> {/* Adjusted icon size */}
                  </div>

                  <div className="mb-3 sm:mb-4"> {/* Adjusted margin */}
                    <span className="text-2xl sm:text-3xl font-bold"> {/* Adjusted text size */}
                      {pkg.credits} Credits
                    </span>
                    {pkg.bonusCredits > 0 && (
                      <div className="text-xs sm:text-sm text-green-600 font-medium"> {/* Adjusted text size */}
                        +{pkg.bonusCredits} bonus credits
                      </div>
                    )}
                  </div>

                  <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-6"> {/* Adjusted text size */}
                    ₹{pkg.monthlyPrice}
                  </div>

                  <button
                    onClick={() =>
                      handleBuy({
                        _id: pkg._id,
                        name: pkg.name,
                        amount: pkg.monthlyPrice,
                        credits: pkg.credits + (pkg.bonusCredits || 0),
                        type: "one-time",
                        cycle: "one-time", // Credit plans are one-time
                      })
                    }
                    className="w-full py-3 sm:py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base" 
                    disabled={!razorpayLoaded} // Disable if Razorpay is not loaded
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "usage" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"> {/* Adjusted grid and gap for mobile */}
            {usageStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/50" 
                >
                  <div className="flex items-center justify-between mb-3 sm:mb-4"> {/* Adjusted margin */}
                    <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color}`} /> {/* Adjusted icon size */}
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" /> {/* Adjusted icon size */}
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-gray-800 mb-1"> {/* Adjusted text size */}
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div> {/* Adjusted text size */}
                </div>
              );
            })}
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6 sm:p-8"> {/* Adjusted padding */}
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6"> {/* Adjusted text size */}
              Credit Usage Over Time
            </h3>
            <div className="h-48 sm:h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center"> {/* Adjusted height */}
              <div className="text-center p-4"> {/* Added padding */}
                <BarChart3 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" /> {/* Adjusted icon size and margin */}
                <p className="text-gray-500 text-sm"> {/* Adjusted text size */}
                  Usage analytics chart would go here
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlansCreditsMainn;
