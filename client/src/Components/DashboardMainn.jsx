import React from "react"; 
import { Copy, Share2, Crown, Zap } from "lucide-react";
import WelcomeSection from "./WelcomeSection";
import QuickStates from "./QuickStates";
import RecentEstimates from "./RecentEstimates.jsx";
// import CreditCard from "./CreditCard.jsx";
import MiniCalender from "./MiniCalender.jsx";

import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";

function DashboardMainn() {
  const { userData, loading } = useUser();

  if (loading || !userData) {
    return null;
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
      <WelcomeSection name="Dashboard" />

      <QuickStates />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <RecentEstimates />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* <CreditCard /> */}

          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <Crown size={24} />
              <div>
                {/* Ensure userData.plan exists before accessing */}
                <h3 className="font-semibold">
                  {userData.plan || "No Plan"} Plan
                </h3>
                <p className="text-purple-100 text-sm">Active subscription</p>
              </div>
            </div>
            <div className="bg-white/20 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100">Credits Remaining</span>
                <Zap size={16} />
              </div>
              {/* Ensure userData.left_credits exists before displaying */}
              <div className="text-2xl font-bold">
                {userData.left_credits !== undefined
                  ? userData.left_credits
                  : "N/A"}
              </div>
            </div>
            <Link to="/plan-credits">
              <button className="w-full bg-white text-purple-600 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                Buy More Credits
              </button>
            </Link>
          </div>
          <MiniCalender />

          {/* Website Link (uncommented if desired) */}
          {/*
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">
              Your Studio Profile
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="text-sm text-gray-600 break-all">
                quotekaro.com/creativestudiopro
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                <Copy size={16} /> Copy
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}

export default DashboardMainn;
