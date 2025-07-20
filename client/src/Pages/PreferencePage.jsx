import React, { useState, useEffect, useRef } from "react";
import WelcomeSection from "../Components/WelcomeSection";
import { useUser } from "../context/UserContext";
import { ArrowBigLeftDash, ArrowBigRightDash, X, Crown, Lock } from "lucide-react";
import axios from "axios";
import ServicesManagement from "./ServicesManagement";
import { toast } from "react-hot-toast";

function PreferencePage() {
  const { userData, refresh } = useUser();

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  
  const [localUserProfile, setLocalUserProfile] = useState({
    selectedEstimateTheme: userData?.selectedEstimateTheme,
  });

  const [allEstimateTemplates, setAllEstimateTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Define plan hierarchy with colors and features
  const PLAN_HIERARCHY = {
    "Basic": { level: 0, color: "gray", bgColor: "bg-gray-100", textColor: "text-gray-800" },
    "Starter": { level: 1, color: "blue", bgColor: "bg-blue-100", textColor: "text-blue-800" },
    "Professional": { level: 2, color: "purple", bgColor: "bg-purple-100", textColor: "text-purple-800" },
    "Enterprise": { level: 3, color: "amber", bgColor: "bg-amber-100", textColor: "text-amber-800" },
  };

  const currentPlan = userData?.plan || "Basic";
  const currentUserPlanLevel = PLAN_HIERARCHY[currentPlan]?.level || 0;

  // Carousel state
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  // Get visible items based on screen size - improved for mobile
  const getVisibleItems = () => {
    if (window.innerWidth >= 1280) return 4; // xl screens
    if (window.innerWidth >= 1024) return 3; // lg screens  
    if (window.innerWidth >= 768) return 2;  // md screens
    return 3; // Mobile: show 3 small cards
  };

  const [visibleItems, setVisibleItems] = useState(getVisibleItems());

  useEffect(() => {
    const handleResize = () => {
      setVisibleItems(getVisibleItems());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Get categories from templates
  const getCategories = () => {
    const categories = ["All"];
    const planCategories = [...new Set(allEstimateTemplates.map(t => t.plan))];
    categories.push(...planCategories);
    return categories;
  };

  // Filter templates by category
  const getFilteredTemplates = () => {
    if (activeCategory === "All") return allEstimateTemplates;
    return allEstimateTemplates.filter(template => template.plan === activeCategory);
  };

  // Fetch estimate templates
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/templates`);
        const fetchedTemplates = response.data.templates;
        setAllEstimateTemplates(fetchedTemplates);

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
            const maxAllowedIndex = Math.max(0, fetchedTemplates.length - getVisibleItems());
            setCurrentIndex(Math.min(themeIndex, maxAllowedIndex));
          }
        } else if (fetchedTemplates.length > 0) {
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

    if (userData) {
      fetchTemplates();
    }
  }, [userData, API_BASE_URL]);

  // Reset carousel when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory]);

  const nextSlide = () => {
    const filteredTemplates = getFilteredTemplates();
    const maxIndex = Math.max(0, filteredTemplates.length - visibleItems);
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSelectTemplate = async (templateId, templatePlan) => {
    if (isSaving) return;

    const templatePlanLevel = PLAN_HIERARCHY[templatePlan]?.level || 0;
    
    if (currentUserPlanLevel < templatePlanLevel) {
      setSelectedPlan(templatePlan);
      setShowUpgradeModal(true);
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
        refresh();
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

  // Upgrade Modal Component
  const UpgradeModal = () => {
    if (!showUpgradeModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 relative animate-in slide-in-from-bottom-4">
          <button
            onClick={() => setShowUpgradeModal(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Required</h3>
            <p className="text-gray-600">
              This premium template requires the <span className="font-semibold text-purple-600">{selectedPlan}</span> plan to unlock.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Access to premium templates</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Advanced customization options</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Priority support</span>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200">
              Upgrade to {selectedPlan}
            </button>
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="w-full text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!userData || loading) {
    return (
      <div className="flex-1 p-0 m-0 md:p-8 overflow-y-auto flex items-center justify-center h-screen bg-white text-purple-500">
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

  const filteredTemplates = getFilteredTemplates();
  const categories = getCategories();

  return (
    <div className="flex-1 p-0 m-0 md:p-8 overflow-y-auto">
      <WelcomeSection name="Preferences" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Template Selection Section */}
        <section className="mb-12">
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Choose Estimate Template
              </h2>
              
              {/* Category Filter - Mobile Horizontal Scroll */}
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      activeCategory === category
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Buttons - Hidden on mobile with 3-card view */}
            {filteredTemplates.length > visibleItems && window.innerWidth >= 768 && (
              <div className="flex items-center justify-center mb-6">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={prevSlide}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                  >
                    <ArrowBigLeftDash size={24} />
                  </button>
                  <span className="text-sm text-gray-500 px-3">
                    {currentIndex + 1} - {Math.min(currentIndex + visibleItems, filteredTemplates.length)} of {filteredTemplates.length}
                  </span>
                  <button
                    onClick={nextSlide}
                    disabled={currentIndex >= filteredTemplates.length - visibleItems}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700"
                  >
                    <ArrowBigRightDash size={24} />
                  </button>
                </div>
              </div>
            )}

            {filteredTemplates.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No templates available for the selected category.
              </div>
            ) : (
              <div className="overflow-hidden">
                {/* Mobile: Horizontal scroll, Desktop: Carousel */}
                <div
                  ref={carouselRef}
                  className={`flex transition-transform duration-300 ease-in-out ${
                    window.innerWidth < 768 ? 'gap-2 overflow-x-auto scrollbar-hide pb-4' : ''
                  }`}
                  style={window.innerWidth >= 768 ? {
                    transform: `translateX(-${currentIndex * (100 / visibleItems)}%)`,
                  } : {}}
                >
                  {filteredTemplates.map((template, index) => {
                    const templatePlanLevel = PLAN_HIERARCHY[template.plan]?.level || 0;
                    const isUnlocked = currentUserPlanLevel >= templatePlanLevel;
                    const isSelected = localUserProfile.selectedEstimateTheme === template.id;
                    const planInfo = PLAN_HIERARCHY[template.plan] || PLAN_HIERARCHY.Basic;

                    return (
                      <div
                        key={template.id}
                        className={`flex-none ${
                          window.innerWidth < 768 
                            ? 'w-32 md:w-40' // Small cards on mobile
                            : visibleItems === 1 ? 'w-full px-2' 
                            : visibleItems === 2 ? 'w-1/2 px-2'
                            : visibleItems === 3 ? 'w-1/3 px-2'
                            : 'w-1/4 px-2'
                        }`}
                      >
                        <div
                          className={`relative bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 h-full overflow-hidden shadow-sm ${
                            isSelected
                              ? "border-purple-500 ring-2 ring-purple-200 shadow-lg"
                              : "border-gray-200 hover:border-gray-300"
                          } ${
                            !isUnlocked
                              ? "opacity-70 cursor-not-allowed"
                              : "hover:shadow-md hover:scale-105"
                          }`}
                          onClick={() =>
                            isUnlocked &&
                            !isSaving &&
                            handleSelectTemplate(template.id, template.plan)
                          }
                        >
                          {/* Lock overlay */}
                          {!isUnlocked && (
                            <div className="absolute inset-0 bg-gradient-to-br from-black/60 to-black/40 flex flex-col items-center justify-center rounded-lg z-10 p-2">
                              <Lock className="w-6 h-6 md:w-8 md:h-8 text-white mb-2" />
                              <span className="text-white text-xs md:text-sm font-semibold text-center leading-tight">
                                {template.plan} Plan
                              </span>
                            </div>
                          )}

                          {/* Template Image - Smaller on mobile */}
                          <div className={`${window.innerWidth < 768 ? 'aspect-[3/4]' : 'aspect-[3/4]'} w-full overflow-hidden rounded-t-lg`}>
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

                          {/* Template Info - Compact on mobile */}
                          <div className={`p-2 ${window.innerWidth >= 768 ? 'md:p-4' : ''}`}>
                            <div className="flex items-center justify-between mb-1 md:mb-2">
                              <h3 className={`font-semibold text-gray-900 truncate ${
                                window.innerWidth < 768 ? 'text-xs' : 'text-sm md:text-base'
                              }`}>
                                {template.name}
                              </h3>
                              {isSelected && (
                                <svg
                                  className="w-4 h-4 md:w-5 md:h-5 text-purple-500 flex-shrink-0"
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
                            
                            {/* Description - Hidden on very small mobile */}
                            {window.innerWidth >= 768 && (
                              <p className="text-xs md:text-sm text-gray-500 mb-2 md:mb-3 line-clamp-2">
                                {template.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs px-2 py-1 rounded-full font-medium ${planInfo.bgColor} ${planInfo.textColor}`}
                              >
                                {template.plan}
                              </span>
                              {isSaving && isSelected && (
                                <span className={`${window.innerWidth < 768 ? 'text-xs' : 'text-sm'} text-purple-500`}>
                                  Saving...
                                </span>
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

            {/* Carousel Indicators - Only show on desktop */}
            {!loading && filteredTemplates.length > visibleItems && window.innerWidth >= 768 && (
              <div className="flex justify-center mt-6 space-x-2">
                {Array.from({
                  length: Math.max(1, filteredTemplates.length - visibleItems + 1),
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

        {/* Services Section */}
        <section className="mb-12">
          <ServicesManagement userId={userData._id} />
        </section>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal />
    </div>
  );
}

export default PreferencePage;