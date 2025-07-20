// export default ThemeMinimal;
import React, { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import {
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaShareAlt,
  FaDownload,
  FaArrowLeft,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { useUser } from "../../context/UserContext";

// Import the utility functions for S3 upload and database update
import {
  uploadPdfToS3Backend,
  updateEstimateInDb,
} from "../../Utils/pdfShareUtils";
import ChooseTemplateBtn from "../../Utils/ChooseTemplateBtn";




const ThemeMinimal = ({ estimate, studio, onGoBack }) => {
  const { userData, loading: userLoading } = useUser();

  // State for managing the loading/feedback modal
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("loading"); // 'loading', 'success', 'error', 'info'
  // State to apply temporary styles for PDF capture
  const [captureStyles, setCaptureStyles] = useState({});

  if (!userData || userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-gray-600 text-lg">Loading user data...</div>
      </div>
    );
  }

  const firebaseUID = userData.firebaseUID;
  console.log("Studio (User) Data:", studio);
  console.log("Estimate Data:", estimate);
  console.log("Firebase UID:", firebaseUID);

  // printRef is used to reference the DOM element that will be converted to PDF
  const printRef = useRef(null);

  const defaultEstimate = {
    _id: "ES-0269",
    clientName: "Emily Hana",
    functionName: "Wedding Photography Estimate",
    location: "456 Client Street, Client town, ST 67890",
    phoneNumber: "(987) 654-3210",
    startDate: new Date("2029-01-30"),
    endDate: null,
    description:
      "A detailed estimate for wedding photography services covering the ceremony and reception.",
    services: [
      {
        serviceName: "Basic Package",
        description: "4 hours of coverage, 200 edited photos",
        total: 1000,
      },
      {
        serviceName: "Standard Package",
        description: "6 hours of coverage, 300 edited photos, 1 album",
        total: 1500,
      },
      {
        serviceName: "Premium Package",
        description: "8 hours of coverage, 400 edited photos, 2 albums",
        total: 2000,
      },
      {
        serviceName: "Deluxe Package",
        description: "Full-day coverage, 500 edited photos, 3 albums",
        total: 2500,
      },
    ],
    subtotal: 7000,
    discountType: "amount",
    discount: 0,
    tax: { percentage: 0, amount: 0 },
    netTotal: 7000,
    notes: "A deposit of $500 is required to secure the booking.",
    terms: [
      "Cancellation policy: Deposit is non-refundable if cancelled less than 60 days before the event.",
    ],
  };

  const estimateData = { ...defaultEstimate, ...estimate };
  const studioData = {
    name: "Perfect Moment",
    phone: "(123) 456-7890",
    email: "info@perfectmoment.com",
    address: {
      d_address: "123 Photography Lane",
      city: "Amityville",
      state: "ST",
      pincode: "12345",
    },
    logoUrl: null,
    website: null,
    socialLinks: { youtube: null, instagram: null, facebook: null },
    policies: null,
    notes: null,
    ...studio,
  };

  const finalNotes = estimateData.notes;

  let finalTerms = [];
  if (
    studioData.policies &&
    typeof studioData.policies === "string" &&
    studioData.policies.trim() !== ""
  ) {
    finalTerms = studioData.policies
      .split("\n")
      .map((term) => term.trim())
      .filter((term) => term !== "");
  } else if (
    estimateData.terms &&
    Array.isArray(estimateData.terms) &&
    estimateData.terms.length > 0
  ) {
    finalTerms = estimateData.terms;
  }

  let displayDiscountAmount = 0;
  let discountDescription = "";

  if (
    estimateData.discountType === "percentage" &&
    typeof estimateData.discount === "number" &&
    estimateData.discount > 0
  ) {
    displayDiscountAmount =
      (estimateData.subtotal * estimateData.discount) / 100;
    discountDescription = `${estimateData.discount}%`;
  } else if (
    estimateData.discountType === "amount" &&
    typeof estimateData.discount === "number" &&
    estimateData.discount > 0
  ) {
    displayDiscountAmount = estimateData.discount;
    discountDescription = "";
  }

  const amountAfterDiscount = estimateData.subtotal - displayDiscountAmount;

  let actualTaxAmount = 0;
  if (estimateData.tax) {
    if (
      typeof estimateData.tax.amount === "number" &&
      estimateData.tax.amount > 0
    ) {
      actualTaxAmount = estimateData.tax.amount;
    } else if (
      typeof estimateData.tax.percentage === "number" &&
      estimateData.tax.percentage > 0
    ) {
      actualTaxAmount =
        (amountAfterDiscount * estimateData.tax.percentage) / 100;
    }
  }

  let calculatedNetTotal = amountAfterDiscount + actualTaxAmount;

  const formatCurrency = (amount) => {
    if (typeof amount !== "number" || isNaN(amount)) {
      return "N/A";
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      return "Invalid Date";
    }
    return d.toLocaleDateString("en-IN", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // --- Local function to generate PDF Blob from the current estimate's rendered view ---
  const generatePdfBlobFromCurrentView = async () => {
    setModalMessage("Generating PDF...");
    setModalType("loading");
    const input = printRef.current;
    if (!input) {
      console.error("Element for PDF conversion not found.");
      setModalMessage("Error: PDF element not found.");
      setModalType("error");
      return null;
    }

    // Apply temporary styles for PDF capture to ensure A4 dimensions and desktop-like layout
    // These styles will ensure html2canvas captures it as a full-width A4 document.
    setCaptureStyles({
      width: "210mm", // A4 width
      position: "absolute",
      left: "-9999px", // Move off-screen to avoid visual flicker during capture
      top: "-9999px",
      // Ensure flex items maintain row layout during capture
      flexDirection: "row", // Force row layout for desktop-like PDF
      alignItems: "stretch", // Ensure equal height columns
      boxShadow: "none", // Remove shadow for capture
      borderRadius: "0", // Remove border-radius for capture
      "-webkit-print-color-adjust": "exact", // Important for background images in html2canvas
      "print-color-adjust": "exact",
    });

    // Wait for styles to apply (brief timeout)
    await new Promise((resolve) => setTimeout(resolve, 50));

    try {
      const canvas = await html2canvas(input, {
        scale: 1.5, // Higher scale for better resolution, typically 2 or 3
        useCORS: true, // Important for images loaded from external sources (e.g., logoUrl, background)
        logging: false, // Disable html2canvas logging
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add image to the first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages for remaining content
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // Calculate position for the next page
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return pdf.output("blob"); // Return the PDF as a Blob
    } catch (error) {
      console.error("Error generating PDF Blob:", error);
      setModalMessage("Failed to generate PDF. Please try again.");
      setModalType("error");
      return null;
    } finally {
      // Restore original styles after canvas capture
      setCaptureStyles({}); // Clear temporary styles
    }
  };

  // --- Button Handlers ---

  const handleDownloadPdf = async () => {
    if (isProcessingPdf) return;
    setIsProcessingPdf(true);
    setModalMessage("Preparing PDF for download...");
    setModalType("loading");

    try {
      const pdfBlob = await generatePdfBlobFromCurrentView(); // Use local function to get the blob
      if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${estimateData.functionName}_${estimateData.clientName}_Estimate.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setModalMessage("PDF downloaded successfully!");
        setModalType("success");
      } else {
        // Error message already set by generatePdfBlobFromCurrentView if it failed
      }
    } catch (error) {
      console.error("Error during download process:", error);
      setModalMessage(`Failed to download: ${error.message}`);
      setModalType("error");
    } finally {
      setIsProcessingPdf(false);
      if (
        modalType === "success" ||
        modalType === "error" ||
        modalType === "info"
      ) {
        setTimeout(() => setModalMessage(""), 3000);
      }
    }
  };

  const handleShare = async () => {
    if (isProcessingPdf) return;
    setIsProcessingPdf(true);
    setModalMessage("Preparing estimate for sharing...");
    setModalType("loading");

    try {
      // 1. Generate PDF Blob from the current view
      const pdfBlob = await generatePdfBlobFromCurrentView();
      if (!pdfBlob) {
        return; // Exit if PDF generation failed (message already set)
      }

      // 2. Upload PDF to S3 via Backend (using the imported utility function)
      const pdfUrl = await uploadPdfToS3Backend(
        pdfBlob,
        estimateData._id,
        estimateData.clientName,
        estimateData.functionName,
        firebaseUID,
        setModalMessage,
        setModalType
      );
      if (!pdfUrl) {
        return; // Exit if upload failed (message already set)
      }

      // 3. Update Estimate Model in MongoDB via Backend (using the imported utility function)
      const dbUpdateSuccess = await updateEstimateInDb(
        estimateData._id,
        pdfUrl,
        firebaseUID,
        setModalMessage,
        setModalType
      );
      if (!dbUpdateSuccess) {
        return; // Exit if DB update failed (message already set)
      }

      // 4. Share the PDF URL via Web Share API or WhatsApp
      const shareTitle = `Estimate from ${studioData.studioName}`;
      const whatsappMessage = `Hi ${estimateData.clientName},\n\nHere's your estimate from ${studioData.studioName}:\n${pdfUrl}\n\nEstimate ID: ${estimateData._id}\n\nLooking forward to working with you!`;

      if (navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: whatsappMessage,
            url: pdfUrl,
          });
          console.log("Content shared successfully via Web Share API");
          setModalMessage("Estimate shared successfully ✅");
          setModalType("success");
        } catch (error) {
          if (error.name === "AbortError") {
            console.log("Web Share API cancelled by user.");
            setModalMessage("Sharing cancelled.");
            setModalType("info"); // User cancelled, not an error
          } else {
            console.error("Error sharing via Web Share API:", error);
            setModalMessage(
              "Failed to share via Web Share API. Opening WhatsApp directly."
            );
            setModalType("error");
            window.open(
              `https://wa.me/${
                estimateData.phoneNumber
              }?text=${encodeURIComponent(whatsappMessage)}`,
              "_blank"
            );
          }
        }
      } else {
        // Fallback for browsers that do not support Web Share API
        setModalMessage(
          "Web Share API not supported. Opening WhatsApp directly."
        );
        setModalType("info"); // Informational message
        window.open(
          `https://wa.me/${estimateData.phoneNumber}?text=${encodeURIComponent(
            whatsappMessage
          )}`,
          "_blank"
        );
      }
    } catch (error) {
      console.error("Error during share process:", error);
      setModalMessage(`Failed to share estimate: ${error.message}`);
      setModalType("error");
    } finally {
      setIsProcessingPdf(false);
      if (
        modalType === "success" ||
        modalType === "error" ||
        modalType === "info"
      ) {
        setTimeout(() => setModalMessage(""), 3000);
      }
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  // Loading/Feedback Modal Component
  const LoadingModal = ({ message, type }) => {
    if (!message) return null; // Only show if there's a message

    let icon;
    let textColor;
    switch (type) {
      case "loading":
        icon = <FaSpinner className="animate-spin text-4xl" />;
        textColor = "text-blue-500";
        break;
      case "success":
        icon = <FaCheckCircle className="text-4xl" />;
        textColor = "text-green-500";
        break;
      case "error":
        icon = <FaTimesCircle className="text-4xl" />;
        textColor = "text-red-500";
        break;
      case "info": // For cases like Web Share API not supported
        icon = <FaInfoCircle className="text-4xl" />;
        textColor = "text-gray-500";
        break;
      default:
        icon = null;
        textColor = "text-gray-700";
    }

    return (
      <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center max-w-sm text-center">
          {icon && <div className={`mb-4 ${textColor}`}>{icon}</div>}
          <p className="text-lg font-semibold text-gray-800">{message}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 flex flex-col items-center">
      {/* Loading/Feedback Modal */}
      <LoadingModal message={modalMessage} type={modalType} />

      {/* Top Buttons Container - Excluded from PDF print */}
      {/* sm:p-6 ensures reasonable padding on larger screens, p-4 for small mobile */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 no-print p-4 sm:p-0">
        <button
          onClick={handleGoBack}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-700"
          aria-label="Go back"
        >
          <FaArrowLeft size={20} />
        </button>
        <div className="flex space-x-3">
          
          <ChooseTemplateBtn/>
          <button
            onClick={handleShare}
            className="p-2 px-4 rounded-xl font-bold bg-blue-500 hover:bg-blue-600 transition-colors text-white flex items-center justify-center text-sm"
            aria-label="Share estimate"
            disabled={isProcessingPdf}
          >
            <FaShareAlt className="mr-2" size={16} />
            {isProcessingPdf && modalType === "loading"
              ? " Sharing..."
              : " Share"}
          </button>
          <button
            onClick={handleDownloadPdf}
            className="p-2 px-4 rounded-xl font-bold bg-green-500 hover:bg-green-600 transition-colors text-white flex items-center justify-center text-sm"
            aria-label="Download PDF"
            disabled={isProcessingPdf}
          >
            <FaDownload className="mr-2" size={16} />
            {isProcessingPdf && modalType === "loading"
              ? " Generating..."
              : " Download PDF"}
          </button>
        </div>
      </div>

      {/* Main content container for preview and PDF generation */}
      {/* The `estimate-container` will have a fixed width in CSS */}
      <div
        ref={printRef}
        className="pl-40 md:p-0 mx-auto font-sans text-gray-900 bg-white shadow-lg rounded-lg overflow-hidden md:shadow-none md:rounded-none estimate-container"
        style={captureStyles}
      >
        {/* Force flex-row for all screen sizes */}
        <div className="flex flex-row">
          {/* Left Section (Image and Contact Info) */}
          {/* Force w-1/3 for all screen sizes */}
          <div
            className="relative w-1/3 bg-cover bg-center left-panel min-h-[300px]"
            style={{
              backgroundImage: `url('/couplephoto.jpg')`, // Ensure this path is correct
            }}
          >
            <div className="absolute inset-0 bg-black/40"></div>{" "}
            {/* Overlay for better text readability */}
            <div className="relative z-10 flex flex-col h-full text-white ">
              <div className="flex flex-col items-center mb-8 mt-8">
                {/* Logo or Studio Initial */}
                {studioData.logoUrl ? (
                  <div className="mb-2">
                    <img
                      src={studioData.logoUrl}
                      alt="Studio Logo"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-2 w-24 h-24 sm:w-24 sm:h-32 rounded-2xl bg-gray-700 flex items-center justify-center">
                    <span className="text-5xl sm:text-4xl font-bold uppercase">
                      {studioData.studioName
                        ? studioData.studioName.charAt(0)
                        : "S"}
                    </span>
                  </div>
                )}
                <h2 className="text-2xl sm:text-2xl font-extrabold text-white text-center">
                  {studioData.studioName}
                </h2>
              </div>

              {/* Contact Us */}
              <div className="mt-auto p-4 rounded-md bg-black/50 text-sm">
                <h3 className="text-base sm:text-lg font-bold mb-3 uppercase">
                  Contact Us
                </h3>

                {studioData.phone && (
                  <p className="flex items-center mb-1">
                    <FaPhone className="mr-2 text-base" /> {studioData.phone}
                  </p>
                )}
                {studioData?.phone2 && (
                  <p className="flex items-center mb-1">
                    <FaPhone className="mr-2 text-base" /> {studioData?.phone2}
                  </p>
                )}

                {studioData.email && (
                  <p className="flex items-center mb-1">
                    <FaEnvelope className="mr-2 text-base" /> {studioData.email}
                  </p>
                )}

                {studioData.address && (
                  <p className="flex items-start mb-1">
                    <FaMapMarkerAlt className="mr-2 text-base mt-1" />
                    <span>
                      {studioData.address.d_address && (
                        <span>
                          {studioData.address.d_address}
                          <br />
                        </span>
                      )}
                      {studioData.address.city && (
                        <span>{studioData.address.city}, </span>
                      )}
                      {studioData.address.state && (
                        <span>{studioData.address.state}</span>
                      )}
                      {studioData.address.pincode && (
                        <span> - {studioData.address.pincode}</span>
                      )}
                    </span>
                  </p>
                )}

                {studioData.website && (
                  <p className="flex items-center">
                    <span className="mr-2 text-base">🌐</span>
                    <a
                      href={
                        studioData.website.startsWith("http")
                          ? studioData.website
                          : `https://${studioData.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:underline"
                    >
                      {studioData.website}
                    </a>
                  </p>
                )}

                {studioData.socialLinks &&
                  (studioData.socialLinks.youtube ||
                    studioData.socialLinks.instagram ||
                    studioData.socialLinks.facebook) && (
                    <div className="flex space-x-3 mt-4">
                      {studioData.socialLinks.youtube && (
                        <a
                          href={studioData.socialLinks.youtube}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-red-500 transition-colors duration-200"
                        >
                          <FaYoutube size={20} />
                        </a>
                      )}
                      {studioData.socialLinks.instagram && (
                        <a
                          href={studioData.socialLinks.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-pink-500 transition-colors duration-200"
                        >
                          <FaInstagram size={20} />
                        </a>
                      )}
                      {studioData.socialLinks.facebook && (
                        <a
                          href={studioData.socialLinks.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-blue-600 transition-colors duration-200"
                        >
                          <FaFacebook size={20} />
                        </a>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Right Section (Estimate Details) */}
          {/* Force w-2/3 for all screen sizes */}
          <div className="w-2/3 p-6 sm:p-12 right-panel">
            {/* IMPROVED HEADER SECTION */}
            <div className="flex flex-col items-center mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-1 sm:mb-2 text-center uppercase">
                {studioData.studioName}
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 sm:mb-6 text-center">
                {estimateData.functionName}
              </p>

              {/* Grid for details - keep it responsive as it's within the right panel */}
              {/* You can keep sm:grid-cols-2 here, as it's internal to the right panel and looks fine */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 w-full">
                {/* Left Column: Estimate Details */}
                <div className="text-left text-sm sm:text-base mb-4 sm:mb-0">
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Event Type:</span>{" "}
                    {estimateData.functionName}
                  </p>
                  {estimateData.startDate && (
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Event Dates:</span>{" "}
                      {formatDate(estimateData.startDate)}
                      {estimateData.endDate &&
                        ` - ${formatDate(estimate.endDate)}`}
                    </p>
                  )}
                  {estimateData.location && (
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Location:</span>{" "}
                      {estimateData.location}
                    </p>
                  )}
                  {estimateData.description && (
                    <p className="text-gray-700 mb-1 break-words">
                      <span className="font-semibold">Description:</span>{" "}
                      {estimateData.description}
                    </p>
                  )}
                </div>

                {/* Right Column: Client Details */}
                <div className="text-left sm:text-right text-sm sm:text-base">
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Client Name:</span>{" "}
                    {estimateData.clientName}
                  </p>
                  {estimateData.phoneNumber && (
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Phone:</span>{" "}
                      {estimateData.phoneNumber}
                    </p>
                  )}
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Estimate Date:</span>{" "}
                    {formatDate(new Date())}
                  </p>
                </div>
              </div>
            </div>
            {/* END IMPROVED HEADER SECTION */}

            {/* Services Table */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-800 text-white text-left">
                      <th className="py-2 px-3 text-xs sm:py-3 sm:px-4 sm:text-sm font-semibold uppercase">
                        Package
                      </th>
                      <th className="py-2 px-3 text-xs sm:py-3 sm:px-4 sm:text-sm font-semibold uppercase">
                        Description
                      </th>
                      <th className="text-right py-2 px-3 text-xs sm:py-3 sm:px-4 sm:text-sm font-semibold uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {estimateData.services.map((service, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        <td className="py-2 px-3 text-sm sm:py-3 sm:px-4 font-semibold text-gray-700">
                          {service.serviceName}
                        </td>
                        <td className="py-2 px-3 text-sm sm:py-3 sm:px-4 text-gray-700">
                          {service.description}
                        </td>
                        <td className="py-2 px-3 text-right text-sm sm:py-3 sm:px-4 font-semibold text-gray-700">
                          {formatCurrency(service.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex flex-col items-end w-full mb-6 sm:mb-12">
              <div className="w-full sm:w-1/2">
                <div className="flex justify-between py-1 sm:py-2 border-b border-gray-200 text-sm sm:text-base">
                  <span className="text-gray-700 font-semibold">Subtotal:</span>
                  <span className="text-gray-900 font-semibold">
                    {formatCurrency(estimateData.subtotal)}
                  </span>
                </div>
                {displayDiscountAmount > 0 && (
                  <div className="flex justify-between py-1 sm:py-2 border-b border-gray-200 text-sm sm:text-base">
                    <span className="text-gray-700 font-semibold">
                      Discount
                      {discountDescription && ` (${discountDescription})`}:
                    </span>
                    <span className="text-red-500 font-semibold">
                      - {formatCurrency(displayDiscountAmount)}
                    </span>
                  </div>
                )}
                {actualTaxAmount > 0 && (
                  <div className="flex justify-between py-1 sm:py-2 border-b border-gray-200 text-sm sm:text-base">
                    <span className="text-gray-700 font-semibold">
                      Tax (
                      {estimateData.tax?.percentage
                        ? `${estimateData.tax.percentage}%`
                        : "Tax"}
                      ):
                    </span>
                    <span className="text-gray-900 font-semibold">
                      {formatCurrency(actualTaxAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 sm:py-3 border-t-2 border-gray-400 mt-2 sm:mt-4 text-base sm:text-xl">
                  <span className="font-bold text-gray-800 uppercase">
                    Grand Total:
                  </span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(calculatedNetTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Additional Notes - Always take from estimateData as requested */}
            {finalNotes && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">
                  Additional Notes:
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 sm:space-y-2 break-words text-sm sm:text-base">
                  <li>
                    <span className="font-semibold">{finalNotes}</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Terms and Conditions (Policies) - From studioData.policies or fallback to estimateData.terms */}
            {finalTerms && finalTerms.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">
                  Terms and Conditions:
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 sm:space-y-2 break-words text-sm sm:text-base">
                  {finalTerms.map((term, index) => (
                    <li key={index} className="text-gray-600 leading-relaxed">
                      {term}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeMinimal;
