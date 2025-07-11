import React, { useState, useEffect, useRef } from "react";
import WelcomeSection from "../Components/WelcomeSection";
import { useUser } from "../context/UserContext";
import { ArrowBigLeftDash, ArrowBigRightDash } from "lucide-react";
import axios from "axios";
import ServicesManagement from "./ServicesManagement";
import { toast } from "react-hot-toast";

function PreferencePage() {
  const { userData, refresh } = useUser();

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  
  // Initialize localUserProfile with userData's selected theme or null/undefined
  const [localUserProfile, setLocalUserProfile] = useState({
    selectedEstimateTheme: userData?.selectedEstimateTheme,
  });

  const [allEstimateTemplates, setAllEstimateTemplates] = useState([]);
  const [loading, setLoading] = useState(true); // Initial loading state
  const [isSaving, setIsSaving] = useState(false);

  // Define plan hierarchy for comparison (Starter < Professional < Enterprise)
  // Use consistent casing for keys as per your backend enum
  const PLAN_HIERARCHY = {
    "Starter": 0,
    "Professional": 1,
    "Enterprise": 2,
  };

  // Get current plan from user data, default to "Starter" if not set
  // Ensure plan string is consistent with PLAN_HIERARCHY keys
  const currentPlan = userData?.plan || "Starter";
  // Get the plan level, default to 0 (Starter) if not found in hierarchy
  const currentUserPlanLevel = PLAN_HIERARCHY[currentPlan] !== undefined ? PLAN_HIERARCHY[currentPlan] : 0;

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  // Function to determine visible items based on current screen width
  const getVisibleItems = () => {
    if (window.innerWidth >= 1024) { // lg screens
      return 4;
    } else if (window.innerWidth >= 768) { // md screens
      return 2;
    } else { // sm and xs screens
      return 1;
    }
  };

  const [visibleItems, setVisibleItems] = useState(getVisibleItems());

  useEffect(() => {
    const handleResize = () => {
      setVisibleItems(getVisibleItems());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch estimate templates on component mount or when userData changes
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/templates`);
        const fetchedTemplates = response.data.templates;
        setAllEstimateTemplates(fetchedTemplates);

        // Set initial theme if user has none or if default theme is not found
        const initialThemeId = userData?.selectedEstimateTheme;
        if (initialThemeId) {
          setLocalUserProfile((prev) => ({
            ...prev,
            selectedEstimateTheme: initialThemeId,
          }));
          const themeIndex = fetchedTemplates.findIndex(
            (template) => template.id === initialThemeId
          );
          if (themeIndex !== -1) {
            // Adjust current index to bring the selected theme into view
            const maxAllowedIndex = Math.max(0, fetchedTemplates.length - getVisibleItems());
            setCurrentIndex(Math.min(themeIndex, maxAllowedIndex));
          }
        } else if (fetchedTemplates.length > 0) {
          // If no theme selected, default to the first available template
          setLocalUserProfile((prev) => ({
            ...prev,
            selectedEstimateTheme: fetchedTemplates[0].id,
          }));
        }
      } catch (error) {
        console.error("Error fetching estimate templates:", error);
        toast.error("Failed to fetch estimate templates.");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch templates if userData is available (to ensure currentPlan is set for logic)
    if (userData) {
      fetchTemplates();
    }
  }, [userData, API_BASE_URL]); // Added API_BASE_URL and userData as dependencies

  // Carousel navigation functions
  const nextSlide = () => {
    const maxIndex = Math.max(0, allEstimateTemplates.length - visibleItems);
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSelectTemplate = async (templateId, templatePlan) => {
    if (isSaving) return; // Prevent multiple clicks

    // Check if the template is unlocked for the current user's plan
    const templatePlanLevel = PLAN_HIERARCHY[templatePlan] !== undefined ? PLAN_HIERARCHY[templatePlan] : 0; // Default to 0 if plan not found
    
    // --- DEBUGGING LOGS ---
    console.log("--- Template Selection Attempt ---");
    console.log("User's Current Plan:", currentPlan, "(Level:", currentUserPlanLevel, ")");
    console.log("Template Required Plan:", templatePlan, "(Level:", templatePlanLevel, ")");
    console.log("Is Unlocked (currentUserPlanLevel >= templatePlanLevel)?", currentUserPlanLevel >= templatePlanLevel);
    // --- END DEBUGGING LOGS ---

    if (currentUserPlanLevel < templatePlanLevel) {
      toast.error(`This template requires the ${templatePlan} Plan. Please upgrade your subscription.`);
      return;
    }

    setIsSaving(true);
    try {
      const userIdToUpdate = userData?._id;

      if (!userIdToUpdate) {
        toast.error("User ID not available for update.");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/users/${userIdToUpdate}/preferences`,
        { selectedEstimateTheme: templateId }
      );

      if (response.data.success) {
        setLocalUserProfile((prevProfile) => ({
          ...prevProfile,
          selectedEstimateTheme: templateId,
        }));
        refresh(); // Refresh user context to reflect changes globally
        toast.success("Template updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update template.");
      }
    } catch (error) {
      console.error("Error selecting template:", error);
      toast.error("Error updating template. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading until userData and templates are loaded
  if (!userData || loading) {
    return (
      <div className="flex-1 p-0 m-0 md:p-8 overflow-y-auto flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-gray-500 flex items-center text-lg">
          <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading user data and templates...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-0 m-0 md:p-8 overflow-y-auto">
      {/* Header */}
      <WelcomeSection name="Preferences" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Services Section */}
        <section className="mb-12">
          <ServicesManagement userId={userData._id} />
        </section>

        {/* Template Selection Section */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Choose Estimate Template
              </h2>
              {allEstimateTemplates.length > visibleItems && ( // Only show navigation if there are more templates than visible items
                <div className="flex items-center space-x-2">
                  {/* Prev Button */}
                  <button
                    onClick={prevSlide}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                  >
                    <ArrowBigLeftDash size={24} />
                  </button>

                  {/* Next Button */}
                  <button
                    onClick={nextSlide}
                    disabled={currentIndex >= allEstimateTemplates.length - visibleItems}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                  >
                    <ArrowBigRightDash size={24} />
                  </button>
                </div>
              )}
            </div>

            {allEstimateTemplates.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No estimate templates available.</div>
            ) : (
              <div className="overflow-hidden">
                <div
                  ref={carouselRef}
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
                  }}
                >
                  {allEstimateTemplates.map((template) => {
                    // Get template's required plan level, default to 0 if not found
                    const templatePlanLevel = PLAN_HIERARCHY[template.plan] !== undefined ? PLAN_HIERARCHY[template.plan] : 0;
                    // Determine if the template is unlocked for the current user
                    const isUnlocked = currentUserPlanLevel >= templatePlanLevel;
                    const isSelected = localUserProfile.selectedEstimateTheme === template.id;

                    // --- DEBUGGING LOGS (for each template) ---
                    console.log(`Template: ${template.name} (ID: ${template.id})`);
                    console.log(`  Required Plan: ${template.plan} (Level: ${templatePlanLevel})`);
                    console.log(`  User's Plan: ${currentPlan} (Level: ${currentUserPlanLevel})`);
                    console.log(`  Is Unlocked: ${isUnlocked}`);
                    // --- END DEBUGGING LOGS ---

                    return (
                      <div
                        key={template.id}
                        className={`flex-none px-2 
                            ${visibleItems === 1 ? 'w-full' : ''}
                            ${visibleItems === 2 ? 'w-1/2' : ''}
                            ${visibleItems === 4 ? 'w-1/4' : ''}
                        `}
                      >
                        <div
                          className={`
                            relative bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 h-full overflow-hidden shadow-sm
                            ${
                              isSelected
                                ? "border-purple-500 ring-2 ring-purple-200 shadow-lg"
                                : "border-gray-200 hover:border-gray-300"
                            }
                            ${
                              !isUnlocked
                                ? "opacity-60 cursor-not-allowed grayscale"
                                : "hover:shadow-md"
                            }
                          `}
                          onClick={() =>
                            isUnlocked &&
                            !isSaving &&
                            handleSelectTemplate(template.id, template.plan) // Pass template.plan here
                          }
                        >
                          {/* Lock overlay for locked templates */}
                          {!isUnlocked && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center rounded-lg z-10 p-4">
                              <svg
                                className="w-8 h-8 text-white mb-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 15v2m-6 4h12a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2-2V7a4 4 0 118 0v4z"
                                />
                              </svg>
                              <span className="text-white text-sm font-semibold text-center leading-tight">
                                Requires {template.plan} Plan
                              </span>
                            </div>
                          )}

                          {/* Template Image with A4 aspect ratio */}
                          <div className="aspect-[3/4] w-full overflow-hidden rounded-t-lg">
                            <img
                              src={template.image}
                              alt={template.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = `https://placehold.co/400x600/E0E0E0/808080?text=${encodeURIComponent(
                                  template.name
                                )}`;
                              }}
                            />
                          </div>

                          {/* Template Info */}
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 text-base truncate">
                                {template.name}
                              </h3>
                              {isSelected && (
                                <svg
                                  className="w-5 h-5 text-purple-500 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                              {template.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                  template.plan === "Starter"
                                    ? "bg-gray-200 text-gray-800"
                                    : template.plan === "Professional"
                                    ? "bg-blue-200 text-blue-800"
                                    : "bg-purple-200 text-purple-800"
                                }`}
                              >
                                {template.plan}
                              </span>
                              {isSaving && isSelected && (
                                <span className="text-sm text-purple-500">Saving...</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Carousel Indicators */}
            {!loading && allEstimateTemplates.length > visibleItems && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({
                  length: Math.max(1, allEstimateTemplates.length - visibleItems + 1),
                }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      currentIndex === index ? "bg-purple-500 w-4" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default PreferencePage;
