import React, { useRef, useState, useEffect } from "react";
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { FaShareAlt, FaDownload, FaArrowLeft, FaPhone, FaEnvelope, FaMapMarkerAlt, FaYoutube, FaInstagram, FaFacebook, FaSpinner, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaLaptopCode } from "react-icons/fa";
import { Camera, ImageIcon, BookOpen } from "lucide-react";
import { useUser } from '../../context/UserContext'; // Adjust path if necessary

// Import the utility functions for S3 upload and database update
import { uploadPdfToS3Backend, updateEstimateInDb } from "../../Utils/pdfShareUtils"; // Adjust path if necessary

// Import fonts
import '@fontsource/montserrat';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import ChooseTemplateBtn from "../../Utils/ChooseTemplateBtn";
// For "Brush Script MT", it's a system font, typically defined directly in CSS.

const ThemeVintage = ({ estimate, studio, onGoBack }) => {
    const { userData, loading: userLoading } = useUser();
    const [captureStyles, setCaptureStyles] = useState({});
    const [isProcessingPdf, setIsProcessingPdf] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("loading");

    if (!userData || userLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-gray-600 text-lg">Loading user data...</div>
            </div>
        );
    }

    const firebaseUID = userData.firebaseUID;
    // console.log("Studio (User) Data:", studio);
    // console.log("Estimate Data:", estimate);
    // console.log("Firebase UID:", firebaseUID);

    const printRef = useRef(null);

    // Default data structure for preview/fallback - enriched to match template needs
    const defaultEstimate = {
        _id: "ES-0269",
        clientName: "Emily Hana",
        functionName: "Wedding Photography Estimate",
        location: "456 Client Street, Client town, ST 67890",
        phoneNumber: "(987) 654-3210",
        startDate: new Date("2029-01-30"),
        endDate: null,
        description: "A detailed estimate for wedding photography services covering the ceremony and reception.",
        services: [
            { serviceName: "Full-Day Coverage", description: "Up to 12 hours of coverage capturing all the moments", total: 50000 },
            { serviceName: "Engagement Session", description: "2-hour engagement photo session at a location", total: 15000 },
            { serviceName: "Luxury Album", description: "20-page personalized photo album of high-quality prints", total: 20000 },
            { serviceName: "Wedding photo", description: "Wedding photo description", total: 6288 },
            { serviceName: "Wedding photo", description: "Wedding photo description", total: 5000 },
        ],
        subtotal: 96288, // Recalculated based on new services
        discountType: "amount",
        discount: 300,
        tax: { percentage: 0, amount: 0 },
        netTotal: 95988, // Recalculated
        notes: "To confirm by July 15, 2024.",
        terms: ["Cancellation policy: Deposit is non-refundable if cancelled less than 60 days before the event."],
    };

    const estimateData = { ...defaultEstimate, ...estimate };
    const studioData = {
        studioName: "CREATIVE STUDIO J",
        phone: "(123) 456-7890",
        email: "info@creativestudio.com",
        address: { d_address: "123 Photography Lane", city: "Amityville", state: "ST", pincode: "12345" },
        logoUrl: null, // Placeholder for your logo URL, if in image then must be base 64
        website: "www.creativestudioj.com",
        socialLinks: { youtube: null, instagram: "https://instagram.com/creativestudioj", facebook: null },
        policies: "All services require a 50% upfront deposit.\nFinal payment is due upon delivery.\nRescheduling must be done 7 days in advance.\nLate payments may incur interest charges.",
        notes: null,
        ...studio,
    };

    const finalNotes = estimateData.notes;

    let finalTerms = [];
    if (studioData.policies && typeof studioData.policies === 'string' && studioData.policies.trim() !== '') {
        finalTerms = studioData.policies.split('\n').map(term => term.trim()).filter(term => term !== '');
    } else if (estimateData.terms && Array.isArray(estimateData.terms) && estimateData.terms.length > 0) {
        finalTerms = estimateData.terms;
    }

    let displayDiscountAmount = 0;
    let discountDescription = "";

    if (estimateData.discountType === "percentage" && typeof estimateData.discount === 'number' && estimateData.discount > 0) {
        displayDiscountAmount = (estimateData.subtotal * estimateData.discount) / 100;
        discountDescription = `${estimateData.discount}%`;
    } else if (estimateData.discountType === "amount" && typeof estimateData.discount === 'number' && estimateData.discount > 0) {
        displayDiscountAmount = estimateData.discount;
        discountDescription = "";
    }

    const amountAfterDiscount = estimateData.subtotal - displayDiscountAmount;

    let actualTaxAmount = 0;
    if (estimateData.tax) {
        if (typeof estimateData.tax.amount === 'number' && estimateData.tax.amount > 0) {
            actualTaxAmount = estimateData.tax.amount;
        } else if (typeof estimateData.tax.percentage === 'number' && estimateData.tax.percentage > 0) {
            actualTaxAmount = (amountAfterDiscount * estimateData.tax.percentage) / 100;
        }
    }

    let calculatedNetTotal = amountAfterDiscount + actualTaxAmount;


    const formatCurrency = (amount) => {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return 'N/A';
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
            return 'Invalid Date';
        }
        return d.toLocaleDateString("en-IN", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const getServiceIcon = (serviceName) => {
        if (serviceName.toLowerCase().includes("coverage") || serviceName.toLowerCase().includes("photography") || serviceName.toLowerCase().includes("photo")) {
            return <Camera className="w-5 h-5" />;
        }
        if (serviceName.toLowerCase().includes("engagement") || serviceName.toLowerCase().includes("session")) {
            return <ImageIcon className="w-5 h-5" />;
        }
        if (serviceName.toLowerCase().includes("album") || serviceName.toLowerCase().includes("prints")) {
            return <BookOpen className="w-5 h-5" />;
        }
        return <Camera className="w-5 h-5" />; // Default icon
    };

    // --- PDF Generation Logic (CRITICAL for Page Cutting Issue and Margins) ---
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
      width: '210mm', // A4 width
      position: 'absolute',
      left: '-9999px', // Move off-screen to avoid visual flicker during capture
      top: '-9999px',
      // Ensure flex items maintain row layout during capture
      flexDirection: 'row', // Force row layout for desktop-like PDF
      alignItems: 'stretch', // Ensure equal height columns
      boxShadow: 'none', // Remove shadow for capture
      borderRadius: '0', // Remove border-radius for capture
      '-webkit-print-color-adjust': 'exact', // Important for background images in html2canvas
      'print-color-adjust': 'exact',
    });

    // Wait for styles to apply (brief timeout)
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const canvas = await html2canvas(input, {
        scale: 2, // Higher scale for better resolution, typically 2 or 3
        useCORS: true, // Important for images loaded from external sources (e.g., logoUrl, background)
        logging: false, // Disable html2canvas logging
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add image to the first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages for remaining content
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; // Calculate position for the next page
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      return pdf.output('blob'); // Return the PDF as a Blob

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

    // --- Button Handlers (Reused from ThemeMinimal/StarterTemplate) ---
    const handleDownloadPdf = async () => {
        if (isProcessingPdf) return;
        setIsProcessingPdf(true);
        setModalMessage("Preparing PDF for download...");
        setModalType("loading");

        try {
            const pdfBlob = await generatePdfBlobFromCurrentView();
            if (pdfBlob) {
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${estimateData.functionName}_${estimateData.clientName}_Estimate.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                setModalMessage("PDF downloaded successfully!");
                setModalType("success");
            }
        } catch (error) {
            console.error("Error during download process:", error);
            setModalMessage(`Failed to download: ${error.message}`);
            setModalType("error");
        } finally {
            setIsProcessingPdf(false);
            if (modalType === "success" || modalType === "error" || modalType === "info") {
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
            const pdfBlob = await generatePdfBlobFromCurrentView();
            if (!pdfBlob) {
                return;
            }

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
                return;
            }

            const dbUpdateSuccess = await updateEstimateInDb(
                estimateData._id,
                pdfUrl,
                firebaseUID,
                setModalMessage,
                setModalType
            );
            if (!dbUpdateSuccess) {
                return;
            }

            const shareTitle = `Estimate from ${studioData.studioName}`;
            const whatsappMessage = `Hi ${estimateData.clientName},\n\nHere's your estimate from ${studioData.studioName}:\n${pdfUrl}\n\nEstimate ID: ${estimateData._id}\n\nLooking forward to working with you!`;

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
                        setModalType("info");
                    } else {
                        console.error('Error sharing via Web Share API:', error);
                        setModalMessage("Failed to share via Web Share API. Opening WhatsApp directly.");
                        setModalType("error");
                        // Fallback to WhatsApp if Web Share API fails or is cancelled
                        window.open(`https://wa.me/${estimateData.phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                    }
                }
            } else {
                setModalMessage("Web Share API not supported. Opening WhatsApp directly.");
                setModalType("info");
                window.open(`https://wa.me/${estimateData.phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
            }

        } catch (error) {
            console.error("Error during share process:", error);
            setModalMessage(`Failed to share estimate: ${error.message}`);
            setModalType("error");
        } finally {
            setIsProcessingPdf(false);
            // Only clear message if it's a success, error, or info state.
            // For loading, we keep it until the next state.
            if (modalType === "success" || modalType === "error" || modalType === "info") {
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

    // Loading/Feedback Modal Component (from ThemeMinimal)
    const LoadingModal = ({ message, type }) => {
        if (!message) return null;

        let icon;
        let textColor;
        switch (type) {
            case 'loading':
                icon = <FaSpinner className="animate-spin text-4xl" />;
                textColor = "text-yellow-600";
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
            <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center max-w-sm text-center">
                    {icon && <div className={`mb-4 ${textColor}`}>{icon}</div>}
                    <p className="text-lg font-semibold text-gray-800">{message}</p>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white p-4 flex flex-col items-center">
            {isProcessingPdf && <LoadingModal message={modalMessage} type={modalType} />}

            {/* Top Buttons Container - Excluded from PDF print */}
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
            {/* The outer div ensures the A4 size and provides the main padding/margins for the preview */}
            {/* The internal 'content-wrapper' div handles the actual content's padding */}
            <div
                className="mx-auto bg-orange-50/60  p-4 font-['Montserrat'] text-gray-800 shadow-lg rounded-lg"
                style={{
                    width: '210mm', // Fixed A4 width for display on all devices
                    minHeight: '297mm', // Ensure at least one A4 height for consistent preview
                    boxSizing: 'border-box', // Include padding in the width/height calculation
                }}
            >
                <div
                    ref={printRef}
                    // This is the inner div whose content will be captured.
                    // It has the *actual* content padding that you want to see in the PDF margins.
                    className="creative-studio-content-wrapper bg-orange-50/60 p-8 print:p-8" // Increased padding to p-8 for better visual margins, added print:p-8
                    // The print:p-8 class is important here to ensure the padding is applied when printing.
                >
                    <div className="border-t-2 border-b border-[#8B7355] mb-4 print:mb-4"></div>

                    <div className="text-center mb-8 print:mb-4">
                        <div className="flex justify-center items-center gap-2">
                            <div className="w-20 h-20 mb-4 border-2 border-[#8B7355] rounded-full flex items-center justify-center">
                                {studioData.logoUrl ? (
                                    <img src={studioData.logoUrl} alt="Studio Logo" className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <span className="text-3xl font-bold text-[#8B7355]">
                                        {studioData.studioName ? studioData.studioName.charAt(0).toUpperCase() : "S"}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl font-bold tracking-[0.3em] text-gray-800 mb-6 print:text-xl print:mb-3">{studioData.studioName}</h1>
                        </div>
                        <div className="border-t border-[#8B7355] w-full mb-6 print:mb-3"></div>
                    </div>

                    <div className="text-center mb-8 print:mb-4">
                        <h2 className="text-6xl font-script text-gray-800 mb-4 print:text-4xl" style={{ fontFamily: "Brush Script MT, cursive" }}>
                            Estimate
                        </h2>
                        <div className="text-lg mb-2 print:text-base">Estimate For</div>
                        <div className="text-2xl font-bold mb-2 print:text-xl">{estimateData.clientName}</div>
                        <div className="text-lg text-gray-600 print:text-base">{estimateData.functionName}</div>
                        {estimateData.location && (
                            <div className="text-base text-gray-600 print:text-sm mt-1">{estimateData.location}</div>
                        )}
                        {estimateData.startDate && (
                            <div className="text-base text-gray-600 print:text-sm mt-1">
                                Date: {formatDate(estimateData.startDate)}
                                {estimateData.endDate && ` - ${formatDate(estimateData.endDate)}`}
                            </div>
                        )}
                    </div>

                    {/* Services Table */}
                    <div className="mb-8 print:mb-4">
                        <table className="w-full border-2 border-[#8B7355] text-sm print:text-xs">
                            <thead>
                                <tr className="border-b-2 border-[#8B7355]">
                                    <th className="text-left py-4 px-6 font-bold text-lg bg-[#F0EBE0] print:py-2 print:px-3 print:text-base">PACKAGE</th>
                                    <th className="text-right py-4 px-6 font-bold text-lg bg-[#F0EBE0] print:py-2 print:px-3 print:text-base">PRICE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estimateData.services.map((service, index) => (
                                    <tr key={index} className="border-b border-[#8B7355]">
                                        <td className="py-4 px-6 print:py-2 print:px-3">
                                            <div className="flex items-start gap-4">
                                                <div className="text-[#8B7355] mt-1 flex-shrink-0">{getServiceIcon(service.serviceName)}</div>
                                                <div>
                                                    <div className="font-bold text-lg mb-0.5 print:text-base">{service.serviceName}</div>
                                                    {service.description && (
                                                        <div className="text-gray-600 text-sm leading-relaxed print:text-xs">{service.description}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right font-bold text-lg print:py-2 print:px-3 print:text-base">{formatCurrency(service.total)}</td>
                                    </tr>
                                ))}

                                {/* Subtotal row */}
                                <tr className="border-t border-[#8B7355]">
                                    <td className="py-2 px-6 text-left font-semibold print:py-1 print:px-3">Subtotal</td>
                                    <td className="py-2 px-6 text-right font-semibold print:py-1 print:px-3">{formatCurrency(estimateData.subtotal)}</td>
                                </tr>

                                {/* Discount row */}
                                {displayDiscountAmount > 0 && (
                                    <tr>
                                        <td className="py-2 px-6 text-left font-semibold text-red-600 print:py-1 print:px-3">Discount {discountDescription ? `(${discountDescription})` : ''}</td>
                                        <td className="py-2 px-6 text-right font-semibold text-red-600 print:py-1 print:px-3">- {formatCurrency(displayDiscountAmount)}</td>
                                    </tr>
                                )}

                                {/* Tax row */}
                                {actualTaxAmount > 0 && (
                                    <tr>
                                        <td className="py-2 px-6 text-left font-semibold print:py-1 print:px-3">Tax ({estimateData.tax.percentage}%):</td>
                                        <td className="py-2 px-6 text-right font-semibold print:py-1 print:px-3">{formatCurrency(actualTaxAmount)}</td>
                                    </tr>
                                )}

                                {/* Grand Total Row */}
                                <tr className="bg-[#F0EBE0] border-t-2 border-[#8B7355]">
                                    <td className="py-4 px-6 font-bold text-xl print:py-2 print:px-3 print:text-lg">Total (Including GST)</td>
                                    <td className="py-4 px-6 text-right font-bold text-xl print:py-2 print:px-3 print:text-lg">{formatCurrency(calculatedNetTotal)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Notes, Policies, Terms */}
                    <div className="flex justify-between items-start mb-8 print:mb-4 print:items-end">
                        <div className="flex-1 pr-4 w-full">
                            {finalNotes && (
                                <>
                                    <div className="font-bold text-lg mb-3 print:text-base print:mb-2">Notes</div>
                                    <ul className="text-gray-700 space-y-1 text-sm print:text-xs list-disc list-inside">
                                        <li>{finalNotes}</li>
                                    </ul>
                                </>
                            )}
                            {finalTerms.length > 0 && (
                                <div className="mt-6 print:mt-3">
                                    <div className="font-bold text-lg mb-3 print:text-base print:mb-2">Terms and Conditions</div>
                                    <ul className="text-gray-700 space-y-1 text-sm print:text-xs list-disc list-inside">
                                        {finalTerms.map((term, index) => (
                                            <li key={index}>{term}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom border and footer */}
                    <div className="border-t-2 border-[#8B7355] pt-6 print:pt-3">
                        <div className="text-center text-xl font-bold tracking-[0.2em] text-gray-800 print:text-lg">{studioData.studioName}</div>

                        {/* Studio Contact Details in Footer - Adjusted for centering of elements */}
                        <div className="text-center text-gray-600 mt-4 text-sm print:text-xs print:mt-2">
                            {studioData.address && (
                                <div className="mb-1 flex items-center justify-center">
                                    <FaMapMarkerAlt className="inline-block mr-1 text-[#8B7355] flex-shrink-0" />
                                    <span className="break-words">
                                        {studioData.address.d_address}
                                        {studioData.address.d_address && ", "}
                                        {studioData.address.city}
                                        {studioData.address.city && ", "}
                                        {studioData.address.state}
                                        {studioData.address.pincode && ` - ${studioData.address.pincode}`}
                                    </span>
                                </div>
                            )}
                            {studioData.phone && (
                                <div className="mb-1 flex items-center justify-center">
                                    <FaPhone className="inline-block mr-1 text-[#8B7355] flex-shrink-0" />
                                    <span>{studioData.phone}</span>
                                    {studioData.phone2 && <span>, {studioData.phone2}</span>}
                                </div>
                            )}
                            {studioData.email && (
                                <div className="mb-1 flex items-center justify-center">
                                    <FaEnvelope className="inline-block mr-1 text-[#8B7355] flex-shrink-0" />
                                    <a href={`mailto:${studioData.email}`} className="text-gray-600 hover:underline break-words">
                                        {studioData.email}
                                    </a>
                                </div>
                            )}
                            {studioData.website && (
                                <div className="mb-1 flex items-center justify-center">
                                    <a href={`https://${studioData.website}`} target="_blank" rel="noopener noreferrer" className="text-[#8B7355] hover:underline break-words">
                                        {studioData.website}
                                    </a>
                                </div>
                            )}
                            {(studioData.socialLinks?.youtube || studioData.socialLinks?.instagram || studioData.socialLinks?.facebook) && (
                                <div className="flex justify-center space-x-3 mt-2">
                                    {studioData.socialLinks?.youtube && (
                                        <a href={studioData.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-[#8B7355] hover:text-gray-900">
                                            <FaYoutube size={18} />
                                        </a>
                                    )}
                                    {studioData.socialLinks?.instagram && (
                                        <a href={studioData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-[#8B7355] hover:text-gray-900">
                                            <FaInstagram size={18} />
                                        </a>
                                    )}
                                    {studioData.socialLinks?.facebook && (
                                        <a href={studioData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-[#8B7355] hover:text-gray-900">
                                            <FaFacebook size={18} />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Made by QuoteKaro Branding */}
                        <div className="mt-4 text-xs text-gray-500 flex items-center justify-center">
                            <span className="mr-2">Made by</span>
                            <FaLaptopCode className="text-[#8B7355] mr-1" />
                            <span className="font-semibold text-[#8B7355]">QuoteKaro</span>
                        </div>
                    </div>
                    <div className="border-t border-b-2 border-[#8B7355] mt-6 print:mt-3"></div>
                </div>
            </div>
        </div>
    );
};

export default ThemeVintage;