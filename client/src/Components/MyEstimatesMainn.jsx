import { useState } from "react";
import WelcomeSection from "./WelcomeSection";
import {
  Search,
  Plus,
  Eye,
  SquarePen,
  Send,
  Download,
  Trash2,
  X,
  Check,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEstimates } from "../context/EstimateContext";
import { Link } from "react-router-dom";

function MyEstimatesMainn() {
  const { estimates, loading, deleteEstimate } = useEstimates();
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("loading");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  if (loading || !estimates) return null;

  const handleSendEstimate = async (estimate) => {
    console.log(estimate.pdfUrl);
    
    if (isProcessing) return; // Prevent multiple clicks
    setIsProcessing(true);
    setModalMessage("Preparing estimate for sharing...");
    setModalType("loading");

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
  
  const EstimateCard = ({ estimate }) => {
    const navigate = useNavigate();

    const actions = [
      {
        label: "Edit",
        icon: SquarePen,
        color: "yellow",
        onClick: () => navigate(`/edit-estimate/${estimate._id}`),
      },
      {
        label: "Send",
        icon: Send,
        color: "green",
        onClick:() => handleSendEstimate(estimate)
      },
      // {
      //   label: "PDF",
      //   icon: Download,
      //   color: "orange",
      //   onClick: () => console.log("Download"),
      // },
      {
        label: "Delete",
        icon: Trash2,
        color: "red",
        onClick: () => {
          if (confirm("Are you sure you want to delete this estimate?"))
            deleteEstimate(estimate._id);
        },
      },
      {
        label: "View",
        icon: Eye,

        color: "blue",
        onClick: () => navigate(`/preview/${estimate._id}`), // Added onClick for View
      },
    ];

    const statusConfig = {
      rejected: {
        color: "text-red-600",
        bg: "bg-red-100",
        label: "Rejected",
      },
      approved: {
        color: "text-green-600",
        bg: "bg-green-100",
        label: "Approved",
      },
      sent: {
        icon: Check,
        color: "pink-500",
        bg: "bg-emerald-50",
        label: "Sent",
      },
      draft: {
        icon: SquarePen,
        color: "text-blue-500",
        bg: "bg-blue-50",
        label: "Draft",
      },
      pending: {
        icon: Clock,
        color: "text-amber-500",
        bg: "bg-amber-50",
        label: "Pending",
      },
    };

    const StatusBadgee = ({ status }) => {
      const config = statusConfig[status];

      if (!config) return null; // optionally handle unknown statuses

      return (
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}
        >
          {config.label}
          {/* <Icon size={12} /> */}
        </div>
      );
    };

    return (
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200 space-y-4">
        {/* Header */}
        <div className="flex flex-row justify-between sm:flex-row bg-white sm:justify-between sm:items-start">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-black">
              {estimate.clientName}
            </h3>
            <p className="text-sm font-semibold md:py-2 text-gray-700">
              {estimate.functionName}
            </p>
            <div className="text-sm font-semibold text-gray-700">
              {new Date(estimate.startDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>
          </div>

          <div className="sm:m-0 flex-col m-3">
            <div className="text-xl mb-1 font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ₹{estimate.subtotal}
            </div>
            <StatusBadgee status={estimate.status} />
          </div>
        </div>

        {/* Action Buttons - Responsive */}
        <div className="flex flex-wrap md:flex justify-start sm:justify-between gap-2 sm:gap-3">
          {actions.map(
            (
              { label, icon: ActionIcon, color, onClick } // Changed icon to ActionIcon
            ) => (
              <button
                key={label}
                onClick={onClick}
                className={`flex-1 sm:flex-auto flex items-center justify-center gap-2 py-2 px-3 bg-${color}-50 text-${color}-600 rounded-xl font-medium hover:bg-${color}-100 transition-colors`}
                title={label}
              >
                <ActionIcon size={16} /> {/* Used ActionIcon */}
                {label}
              </button>
            )
          )}
        </div>
      </div>
    );
  };

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle size={32} className="text-purple-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No estimates found
      </h3>
      <p className="text-gray-600 mb-6">
        {searchTerm || activeFilter !== "all"
          ? "Try adjusting your search or filters"
          : "Create your first estimate to get started"}
      </p>
      {!searchTerm && activeFilter === "all" && (
        <Link
          to="/new-estimate"
          className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors"
        >
          Create Estimate
        </Link>
      )}
    </div>
  );

  const filteredEstimates = estimates.filter((estimate) => {
    const matchesSearch =
      estimate.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimate.functionName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      activeFilter === "all" || estimate.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
      <WelcomeSection name="MyEstimates" />

      {/* Main */}
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="px-4 py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">My Estimates</h1>
              <Link
                to="/new-estimate"
                className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
              >
                <Plus size={20} />
              </Link>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search estimates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-0 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { key: "all", label: "All", count: estimates.length },
                {
                  key: "sent",
                  label: "Sent",
                  count: estimates.filter((e) => e.status === "sent").length,
                },
                {
                  key: "draft",
                  label: "Draft",
                  count: estimates.filter((e) => e.status === "draft").length,
                },
                {
                  key: "pending",
                  label: "Pending",
                  count: estimates.filter((e) => e.status === "pending").length,
                },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    activeFilter === filter.key
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {filter.label}{" "}
                  {filter.count > 0 && (
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                        activeFilter === filter.key
                          ? "bg-white/20"
                          : "bg-gray-300"
                      }`}
                    >
                      {filter.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6">
          {filteredEstimates.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {filteredEstimates.map((estimate) => (
                <EstimateCard key={estimate._id} estimate={estimate} />
              ))}
            </div>
          )}
        </div>

        {/* Floating Action Button for Mobile */}
        <Link
          to="/new-estimate"
          className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-2xl hover:bg-purple-700 transition-all hover:scale-110 md:hidden"
        >
          <Plus size={24} />
        </Link>
      </div>
    </div>
  );
}

export default MyEstimatesMainn;
