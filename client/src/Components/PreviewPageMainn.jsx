// PreviewPageMainn.jsx
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import axios from "axios";
import { Crown, Zap } from "lucide-react";
import ThemeModern from "./EstimateThemes/ThemeModern.jsx";
import ThemeElegant from "./EstimateThemes/ThemeElegant.jsx";
import ThemeSimple from "./EstimateThemes/ThemeSimple.jsx";
import ThemeMinimal from "./EstimateThemes/ThemeMinimal.jsx";
import ThemeVintage from "./EstimateThemes/ThemeVintage.jsx";
import MiniCalender from "./MiniCalender.jsx";

const PreviewPageMainn = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData, loading: userLoading } = useUser();

  const [estimate, setEstimate] = useState(null);
  const [estimateLoading, setEstimateLoading] = useState(true);

  useEffect(() => {
    setEstimateLoading(true);
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/estimates/get-by-id/${id}`)
      .then((res) => {
        if (res.data.success) {
          setEstimate(res.data.estimate);
        }
      })
      .catch((error) => {
        console.error("Error fetching estimate:", error);
      })
      .finally(() => {
        setEstimateLoading(false);
      });
  }, [id]);

  if (userLoading || estimateLoading || !userData || !estimate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div>Loading estimate details...</div>
      </div>
    );
  }

  const selectedTheme = userData.selectedEstimateTheme;

  const renderTheme = () => {
    switch (selectedTheme) {
      case "Modern":
        return <ThemeModern estimate={estimate} studio={userData} />;
      case "Minimal":
        return <ThemeMinimal estimate={estimate} studio={userData} />;
      case "Elegant":
        return <ThemeElegant estimate={estimate} studio={userData} />;
      case "Vintage":
        return <ThemeVintage estimate={estimate} studio={userData} />;
      default:
        return <ThemeSimple estimate={estimate} studio={userData} />;
    }
  };

  const handleGoToPreferences = () => {
    navigate("/settings/preferences");
  };

  return (
    // REMOVED min-h-screen. The body/html should handle the main scroll.
    // md:w-screen is fine for larger screens where you control the width.
    <div className="md:w-screen">
      <div className="flex justify-center ">
        {renderTheme()}
        {/* Side panel for desktop, ensure it doesn't cause overflow on mobile */}
        {/* This div is 'hidden' on small screens, so it shouldn't be the cause of mobile overflow. */}
        <div className="p-5 w-3/4 mx-2 md:block hidden ">
          <div className=" my-4">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <Crown size={24} />
                <div>
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
          </div>
          <div className=" my-4">
            <MiniCalender />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPageMainn;  