import React, { useState } from "react"; // Added useState
import { Plus, Edit, Send } from "lucide-react"; // Keep existing imports
import { Link } from "react-router-dom";
import { useEstimates } from "../context/EstimateContext";
import { useUser } from "../context/UserContext";
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa"; // Added icons for modal

function RecentEstimates() {
  const { userData } = useUser();
  const { estimates, loading } = useEstimates();

  // State for managing the loading/feedback modal
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("loading"); // 'loading', 'success', 'error', 'info'

  if (loading || !estimates) return null;

  const recentEstimates = [...estimates]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  // Mock studio data, similar to ThemeMinimal, as RecentEstimates doesn't receive it as a prop.
  // In a real app, this would ideally come from your useUser context or a dedicated StudioContext.
  const mockStudioData = {
    name: "Perfect Moment",
    phone: "(123) 456-7890",
    email: "info@perfectmoment.com",
    address: { d_address: "123 Photography Lane", city: "Amityville", state: "ST", pincode: "12345" },
    logoUrl: null,
    website: null,
    socialLinks: { youtube: null, instagram: null, facebook: null },
    policies: null,
    notes: null,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "viewed":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // NEW: handleSendEstimate function
  const handleSendEstimate = async (estimate) => {
    if (isProcessing) return; // Prevent multiple clicks
    setIsProcessing(true);
    setModalMessage("Preparing estimate for sharing...");
    setModalType("loading");

    try {
      const pdfUrl = estimate.pdfUrl; // Get the PDF URL directly from the estimate object
      if (!pdfUrl) {
        setModalMessage("Error: PDF URL not found for this estimate.");
        setModalType("error");
        return;
      }

      // Optional: Update estimate status to 'sent' in MongoDB if it's not already
      // This part is similar to ThemeMinimal's step 3, but simplified as PDF is already uploaded
      if (estimate.status !== 'sent' && userData && userData.firebaseUID) {
          setModalMessage(`Updating estimate status to 'sent'...`);
          const backendUrl = import.meta.env.VITE_BACKEND_URL;
          if (!backendUrl) {
              throw new Error("VITE_BACKEND_URL is not defined in your environment variables.");
          }

          const response = await fetch(`${backendUrl}/api/estimates/${estimate._id}/update-pdf-url`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  pdfUrl: pdfUrl,
                  status: 'sent',
                  firebaseUID: userData.firebaseUID, // Send firebaseUID from context
              }),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Failed to update estimate status in MongoDB: ${errorData.message || response.statusText}`);
          }
          console.log("MongoDB update response:", await response.json());
      }


      // Share the PDF URL via Web Share API or WhatsApp
      const shareTitle = `Estimate from ${mockStudioData.name}`;
      const whatsappMessage = `Hi ${estimate.clientName},\n\nHere's your estimate from ${mockStudioData.name}:\n${pdfUrl}\n\nEstimate ID: ${estimate._id}\n\nLooking forward to working with you!`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: whatsappMessage,
            url: pdfUrl,
          });
          console.log('Content shared successfully via Web Share API');
          setModalMessage("Estimate shared successfully ✅");
          setModalType("success");
        } catch (error) {
          if (error.name === 'AbortError') {
            console.log('Web Share API cancelled by user.');
            setModalMessage("Sharing cancelled.");
            setModalType("info"); // Use 'info' for user cancellation
          } else {
            console.error('Error sharing via Web Share API:', error);
            setModalMessage("Failed to share via Web Share API. Opening WhatsApp directly.");
            setModalType("error");
            window.open(`https://wa.me/${estimate.phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
          }
        }
      } else {
        // Fallback for browsers that do not support Web Share API
        setModalMessage("Web Share API not supported. Opening WhatsApp directly.");
        setModalType("info");
        window.open(`https://wa.me/${estimate.phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
      }

    } catch (error) {
      console.error("Error during share process:", error);
      setModalMessage(`Failed to share estimate: ${error.message}`);
      setModalType("error");
    } finally {
      setIsProcessing(false);
      setTimeout(() => setModalMessage(""), 3000); // Clear message after 3 seconds
    }
  };

  // Loading/Feedback Modal Component (reused from ThemeMinimal)
  const LoadingModal = ({ message, type }) => {
    if (!message) return null;

    let icon;
    let textColor;
    switch (type) {
      case 'loading':
        icon = <FaSpinner className="animate-spin text-4xl" />;
        textColor = "text-blue-500";
        break;
      case 'success':
        icon = <FaCheckCircle className="text-4xl" />;
        textColor = "text-green-500";
        break;
      case 'error':
        icon = <FaTimesCircle className="text-4xl" />;
        textColor = "text-red-500";
        break;
      case 'info':
        icon = <FaInfoCircle className="text-4xl" />;
        textColor = "text-gray-500";
        break;
      default:
        icon = null;
        textColor = "text-gray-700";
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center max-w-sm text-center">
          {icon && <div className={`mb-4 ${textColor}`}>{icon}</div>}
          <p className="text-lg font-semibold text-gray-800">{message}</p>
        </div>
      </div>
    );
  };


  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <LoadingModal message={modalMessage} type={modalType} /> {/* Add the modal here */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">
          Recent Estimates
        </h2>
        <Link
          to="/new-estimate"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Create New
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Client
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Occasion
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Amount
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Date
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Status
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {[...recentEstimates].slice(0, 5).map((estimate) => (
              <tr
                key={estimate._id}
                className="border-b border-gray-50 hover:bg-gray-25"
              >
                <td className="p-4">
                  <div className="font-medium text-gray-800">
                    {estimate.clientName}
                  </div>
                </td>
                <td className="p-4 text-gray-600">{estimate.functionName}</td>
                <td className="p-4 font-medium text-gray-800">
                  ₹{estimate.netTotal}
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(estimate.startDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      estimate.status
                    )}`}
                  >
                    {estimate.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Link to={`/edit-estimate/${estimate._id}`}
                      className="p-1 text-gray-600 hover:text-green-600"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Link>
                    <button
                      onClick={() => handleSendEstimate(estimate)} // Call the new handler
                      className="p-1 text-gray-600 hover:text-purple-600"
                      title="Send via WhatsApp"
                      disabled={isProcessing} // Disable while processing
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentEstimates;
