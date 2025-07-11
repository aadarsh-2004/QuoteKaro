import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useEstimates } from "../context/EstimateContext"; // If you need all estimates elsewhere, keep this.
import axios from "axios";

import ThemeModern from "../Components/EstimateThemes/ThemeModern.jsx";

import ThemeElegant from "../Components/EstimateThemes/ThemeElegant.jsx";
import ThemeSimple from "../Components/EstimateThemes/ThemeSimple.jsx";
import ThemeMinimal from "../Components/EstimateThemes/ThemeMinimal.jsx";
import ThemeVintage from "../Components/EstimateThemes/ThemeVintage";

const PreviewEstimate = () => {
  const { id } = useParams();
  // const { estimates } = useEstimates(); // This might not be needed if you fetch by ID
  const { userData, loading: userLoading } = useUser(); // Rename to avoid conflict if needed

  const [estimate, setEstimate] = useState(null);
  const [estimateLoading, setEstimateLoading] = useState(true); // New loading state for estimate

  useEffect(() => {
    setEstimateLoading(true); // Set loading true when starting fetch
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/estimates/get-by-id/${id}`)
      .then(res => {
        if (res.data.success) {
          setEstimate(res.data.estimate);
        }
      })
      .catch(error => {
        console.error("Error fetching estimate:", error);
        // Handle error, maybe set an error state
      })
      .finally(() => {
        setEstimateLoading(false); // Set loading false after fetch
      });
  }, [id]);

  // Check both user data and estimate data loading states
  if (userLoading || estimateLoading || !userData || !estimate) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div>Loading estimate details...</div>
        </div>
    );
  }

  const selectedTheme = userData.selectedEstimateTheme;

  const renderTheme = () => {
    // Pass the specific 'estimate' object from state, and 'userData' for studio details
    switch (selectedTheme) {
       case "Modern": return <ThemeModern estimate={estimate} studio={userData} />;
       case "Minimal": return <ThemeMinimal estimate={estimate} studio={userData} />;
       case "Elegant": return <ThemeElegant estimate={estimate} studio={userData} />;
       case "Vintage": return <ThemeVintage estimate={estimate} studio={userData} />;
      default: return <ThemeSimple estimate={estimate} studio={userData} />;
    }
  };

  return <div className="min-h-screen bg-gray-100 p-6">{renderTheme()}</div>;
};

export default PreviewEstimate;