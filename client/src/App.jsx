import { useEffect } from "react";
import "./App.css";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import { saveUIDToLocalStorage } from "./auth";
import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";

import Dashboard from "./Pages/Dashboard";
import MyEstimates from "./Pages/MyEstimates";
import NewEstimate from "./Pages/NewEstimate";
import EditEstimate from "./Pages/EditEstimate";
import { Toaster } from "react-hot-toast";
import PlansCredits from "./Pages/PlansCredits";
import Notifications from "./Components/NotificationMainn";
import PreviewPage from "./Pages/PreviewPage";
import PrivacyPolicyPage from "./Pages/PrivacyPolicyPage";
import TermsConditionsPage from "./Pages/TermsConditionsPage";
import RefundPolicyPage from "./Pages/RefundPolicyPage";
import AboutUsPage from "./Pages/AboutUsPage";
import LandingPage from "./Pages/LandingPage";
import PricingLandingPage from "./Pages/PricingLandingPage";
import ForgotPassword from "./Components/ForgotPassword";
import ResetPassword from "./Components/ResetPassword";
import ProfilePage from "./Pages/ProfilePage";
import Preference from "./Pages/Preference";
import { Helmet } from "react-helmet-async";
import Blogs from "./Pages/Blogs";
import FeaturesPage from "./Pages/FeaturesPage";

function App() {
  useEffect(() => {
    saveUIDToLocalStorage();
  }, []);



  return (
    <>
      <Toaster position="top-center" />
      {/* Content */}
      <Helmet>
        <title>QuoteKaro | Instant Estimates for Photographers & Studios</title>
        <meta
          name="description"
          content="Create instant, professional estimates for any photography shoot. Save time, impress clients, and grow your studio with QuoteKaro – India’s smart estimate maker for all photographers."
        />
        <meta
          name="keywords"
          content="photography estimate software, photography quote generator, SaaS for photographers, estimate tool for studios, studio estimate generator, freelance photographer estimate, photo studio quotation app, instant photography estimates, custom photography quotes, send photography proposal, India photography software"
        />
        {/* You can also add default Open Graph/Twitter tags here if you want them to apply to every page,
            but typically page-specific OG/Twitter tags are more effective. The ones in index.html act as ultimate fallbacks. */}
      </Helmet>

      <BrowserRouter>
       
        <Routes>
          <Route
            path="/"
            element={
              localStorage.getItem("firebaseUID") ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LandingPage />
              )
            }
          />
          <Route path="/register" element={<Register />} />
         
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-estimates" element={<MyEstimates />} />
          <Route path="/edit-estimate/:id" element={<EditEstimate />} />
          <Route path="/new-estimate" element={<NewEstimate />} />
          <Route path="/plan-credits" element={<PlansCredits />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings/profile" element={<ProfilePage />} />
          <Route path="/settings/preferences" element={<Preference />} />
          <Route path="/preview/:id" element={<PreviewPage />} />

          {/* Add routes for your policy pages if they are separate components */}
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-conditions" element={<TermsConditionsPage />} />
          <Route path="/return-refund-policy" element={<RefundPolicyPage />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/pricing" element={<PricingLandingPage />} />
          <Route path="/blog" element={<Blogs />} />
          <Route path="/features" element={<FeaturesPage />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
