import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.jsx";
import axios from "axios";

import ThemeModern from "./EstimateThemes/ThemeModern.jsx";
import ThemeElegant from "./EstimateThemes/ThemeElegant.jsx";
import ThemeSimple from "./EstimateThemes/ThemeSimple.jsx";
import ThemeMinimal from "./EstimateThemes/ThemeMinimal.jsx";
import ThemeVintage from "./EstimateThemes/ThemeVintage.jsx";
import MiniCalender from "./MiniCalender.jsx";
import CreditCard from "./CreditCard.jsx";

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
        <div className="p-5 w-full md:block hidden ">
          <div className=" my-4">
            <CreditCard />
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
