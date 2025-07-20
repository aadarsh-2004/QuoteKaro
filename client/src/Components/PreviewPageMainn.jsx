import { useParams, useNavigate, Link } from "react-router-dom"; // Import useNavigate
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
// import CreditCard from "./CreditCard.jsx";

const PreviewPageMainn = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
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

  // Function to handle navigation to the preferences page
  const handleGoToPreferences = () => {
    navigate("/settings/preferences"); // Navigate to the /preference route
  };

  return (
    <div className="min-h-screen  md:w-screen">
      <div className="flex justify-center ">
        {/* <div className="flex justify-end mb-4"> 
          <button
            onClick={handleGoToPreferences}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Change Template
          </button>
        </div> */}

        {renderTheme()}
        <div className="p-5 w-3/4 mx-2 md:block  hidden  ">
          {/* CreditCard */}
          <div className=" my-4">
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
            {/* <CreditCard /> */}
          </div>

          {/* Calender */}
          <div className=" my-4">
            <MiniCalender />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewPageMainn;
