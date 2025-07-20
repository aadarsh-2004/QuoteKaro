import React, { useRef, useState } from "react";
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { FaShareAlt, FaDownload, FaArrowLeft, FaPhone, FaEnvelope, FaMapMarkerAlt, FaYoutube, FaInstagram, FaFacebook, FaSpinner, FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";
import { Camera, ImageIcon, BookOpen } from "lucide-react";
import { useUser } from '../../context/UserContext'; // Assuming this path is correct for your project

// Import the utility functions for S3 upload and database update
import { uploadPdfToS3Backend, updateEstimateInDb } from "../../Utils/pdfShareUtils"; // Assuming this path is correct

// // Import fonts
import '@fontsource/montserrat';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/playfair-display'; // For the elegant titles
import ChooseTemplateBtn from "../../Utils/ChooseTemplateBtn";

const ThemeElegant = ({ estimate, studio, onGoBack }) => {
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


    const printRef = useRef(null);

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
            { serviceName: "Basic Package", description: "4 hours of coverage, 200 edited photos", total: 1000 },
            { serviceName: "Standard Package", description: "6 hours of coverage, 300 edited photos, 1 album", total: 1500 },
            { serviceName: "Premium Package", description: "8 hours of coverage, 400 edited photos, 2 albums", total: 2000 },
            { serviceName: "Deluxe Package", description: "Full-day coverage, 500 edited photos, 3 albums", total: 2500 },
        ],
        subtotal: 7000,
        discountType: "amount",
        discount: 0,
        tax: { percentage: 0, amount: 0 },
        netTotal: 7000,
        notes: "A deposit of $500 is required to secure the booking.",
        terms: ["Cancellation policy: Deposit is non-refundable if cancelled less than 60 days before the event."],
    };

    const estimateData = { ...defaultEstimate, ...estimate };
    const studioData = {
        name: "Perfect Moment",
        phone: "(123) 456-7890",
        email: "info@perfectmoment.com",
        address: { d_address: "123 Photography Lane", city: "Amityville", state: "ST", pincode: "12345" },
        logoUrl: null,
        website: null,
        socialLinks: { youtube: null, instagram: null, facebook: null },
        policies: null,
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
        if (serviceName.toLowerCase().includes("coverage") || serviceName.toLowerCase().includes("photography")) {
            return <Camera className="w-5 h-5" />;
        }
        if (serviceName.toLowerCase().includes("engagement") || serviceName.toLowerCase().includes("session")) {
            return <ImageIcon className="w-5 h-5" />;
        }
        if (serviceName.toLowerCase().includes("album") || serviceName.toLowerCase().includes("prints")) {
            return <BookOpen className="w-5 h-5" />;
        }
        return <Camera className="w-5 h-5" />;
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
        // IMPORTANT: Added `color-adjust: exact` and `print-color-adjust: exact`
        setCaptureStyles({
            width: '210mm', // A4 width
            minHeight: '297mm', // A4 height
            position: 'absolute',
            left: '-9999px', // Move off-screen to avoid visual flicker during capture
            top: '-9999px',
            boxShadow: 'none', // Remove shadow for capture
            borderRadius: '0', // Remove border-radius for capture
            backgroundColor: '#ffffff', // Ensure white background for PDF
            // Crucial for forcing colors and backgrounds in html2canvas/print
            WebkitPrintColorAdjust: 'exact', // For Webkit browsers (Chrome, Safari)
            colorAdjust: 'exact', // Standard property
        });

        // Wait for styles to apply (brief timeout)
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const canvas = await html2canvas(input, {
                scale: 1.5, // Higher scale for better resolution, typically 2 or 3
                useCORS: true, // Important for images loaded from external sources (e.g., logoUrl, background)
                logging: false, // Disable html2canvas logging
                backgroundColor: null, // Let the applied background color from CSS take effect
                // Attempt to render with full color support
                allowTaint: true, // Allows images from other origins to be drawn, but taints the canvas
                ignoreElements: (element) => {
                    // Ignore elements with 'no-print' class during capture
                    return element.classList.contains('no-print');
                },
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
                const a = document.createElement('a');
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
            const shareTitle = `Estimate from ${studioData.studioName}`; // Corrected from studioData.studioName to studioData.studioName
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
                        setModalType("info"); // User cancelled, not an error
                    } else {
                        console.error('Error sharing via Web Share API:', error);
                        setModalMessage("Failed to share via Web Share API. Opening WhatsApp directly.");
                        setModalType("error");
                        window.open(`https://wa.me/${estimateData.phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                    }
                }
            } else {
                // Fallback for browsers that do not support Web Share API
                setModalMessage("Web Share API not supported. Opening WhatsApp directly.");
                setModalType("info"); // Informational message
                window.open(`https://wa.me/${estimateData.phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
            }

        } catch (error) {
            console.error("Error during share process:", error);
            setModalMessage(`Failed to share estimate: ${error.message}`);
            setModalType("error");
        } finally {
            setIsProcessingPdf(false);
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

    // Loading/Feedback Modal Component
    const LoadingModal = ({ message, type }) => {
        if (!message) return null; // Only show if there's a message

        let icon;
        let textColor;
        switch (type) {
            case 'loading':
                icon = <FaSpinner className="animate-spin text-4xl" />;
                textColor = "text-purple-500"; // Purple
                break;
            case 'success':
                icon = <FaCheckCircle className="text-4xl" />;
                textColor = "text-green-500";
                break;
            case 'error':
                icon = <FaTimesCircle className="text-4xl" />;
                textColor = "text-red-500";
                break;
            case 'info': // For cases like Web Share API not supported
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
            {isProcessingPdf && <LoadingModal message={modalMessage} type={modalType} />}

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

            <div
                ref={printRef}
                // className="bg-white text-gray-800 shadow-lg estimate-container print-a4-document-wrapper"
                className="w-screen h-screen md:w-[210mm] md:min-h-[297mm] mx-auto bg-white text-gray-800 shadow-lg print-a4-document-wrapper overflow-hidden" // Fixed width for A4
                style={captureStyles} // Apply dynamic styles for PDF capture
            >
                <div className="flex flex-col h-full"> {/* Flex container for content */}
                    {/* Header Section */}
                    <div className="flex justify-between items-start p-8 pb-4 bg-purple-50"> {/* Light purple background */}
                        <div className="flex flex-col items-start w-1/2">
                            {studioData.logoUrl ? (
                                <img src={studioData.logoUrl} alt="Studio Logo" className="h-20 w-auto object-contain mb-4" />
                            ) : (
                                <div className="h-20 w-20 flex items-center justify-center text-5xl font-bold text-purple-500 bg-white rounded-full border-2 border-purple-500 mb-4">
                                    {studioData.studioName ? studioData.studioName.charAt(0).toUpperCase() : "S"}
                                </div>
                            )}
                            <h1 className="text-4xl font-extrabold text-purple-500 font-['Playfair_Display'] mb-2 tracking-wide">
                                {studioData.studioName}
                            </h1>
                            <div className="text-sm text-gray-600">
                                {studioData.address.d_address}, {studioData.address.city}, {studioData.address.state}, {studioData.address.pincode}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mt-2">
                                <FaPhone className="mr-2 text-pink-400" />
                                {studioData.phone}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                                <FaEnvelope className="mr-2 text-pink-400" />
                                {studioData.email}
                            </div>
                        </div>

                        <div className="flex flex-col items-end text-right w-1/2 mt-4">
                            <h2 className="text-6xl font-['Playfair_Display'] text-pink-400 mb-4 font-bold">Estimate</h2>
                            <p className="text-sm text-gray-600 mb-1">Estimate ID: <span className="font-semibold text-purple-500">{estimateData._id}</span></p>
                            <p className="text-sm text-gray-600 mb-1">Date: <span className="font-semibold text-purple-500">{formatDate(new Date())}</span></p>
                        </div>
                    </div>

                    {/* Client Information Section */}
                    <div className="p-8 py-6 bg-white border-b-2 border-dashed border-gray-300">
                        <h3 className="text-xl font-bold text-purple-500 mb-3 font-['Montserrat']">Estimate For</h3>
                        <p className="text-lg font-semibold text-gray-800">{estimateData.clientName}</p>
                        <p className="text-md text-gray-600">{estimateData.functionName}</p>
                        {estimateData.location && (
                            <p className="text-sm text-gray-600"><FaMapMarkerAlt className="inline-block mr-1 text-gray-500" />{estimateData.location}</p>
                        )}
                        {estimateData.startDate && (
                            <p className="text-sm text-gray-600">
                                Date: {formatDate(estimateData.startDate)}
                                {estimateData.endDate && ` - ${formatDate(estimateData.endDate)}`}
                            </p>
                        )}
                        {estimateData.phoneNumber && (
                            <p className="text-sm text-gray-600"><FaPhone className="inline-block mr-1 text-gray-500" />{estimateData.phoneNumber}</p>
                        )}
                    </div>

                    {/* Services Table Section */}
                    <div className="p-8 flex-grow">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F8F3FC] text-purple-500 uppercase text-sm">
                                    <th className="py-3 px-4 rounded-tl-lg">Service</th>
                                    <th className="py-3 px-4">Description</th>
                                    <th className="py-3 px-4 text-right rounded-tr-lg">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estimateData.services.map((service, index) => (
                                    <tr key={index} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="py-3 px-4 flex items-center font-semibold text-gray-800">
                                            {getServiceIcon(service.serviceName)}
                                            <span className="ml-2">{service.serviceName}</span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 text-sm">{service.description}</td>
                                        <td className="py-3 px-4 text-right font-semibold text-gray-800">{formatCurrency(service.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals Section */}
                        <div className="flex justify-end mt-6">
                            <div className="w-full sm:w-1/2">
                                <div className="flex justify-between items-center py-2 border-t border-gray-300">
                                    <span className="text-md font-medium text-gray-700">Subtotal:</span>
                                    <span className="text-md font-medium text-gray-800">{formatCurrency(estimateData.subtotal)}</span>
                                </div>

                                {displayDiscountAmount > 0 && (
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-md font-medium text-red-500">Discount {discountDescription ? `(${discountDescription})` : ''}:</span>
                                        <span className="text-md font-medium text-red-500">- {formatCurrency(displayDiscountAmount)}</span>
                                    </div>
                                )}

                                {actualTaxAmount > 0 && (
                                    <div className="flex justify-between items-center py-2">
                                        <span className="text-md font-medium text-gray-700">Tax ({estimateData.tax.percentage}%):</span>
                                        <span className="text-md font-medium text-gray-800">{formatCurrency(actualTaxAmount)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center py-3 mt-4 bg-pink-400 text-white rounded-lg px-4">
                                    <span className="text-xl font-bold">Total:</span>
                                    <span className="text-xl font-bold">{formatCurrency(calculatedNetTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notes and Terms */}
                    <div className="p-8 pt-4 border-t-2 border-dashed border-gray-300">
                        {finalNotes && (
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-purple-500 mb-2 font-['Montserrat']">Notes:</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">{finalNotes}</p>
                            </div>
                        )}

                        {finalTerms.length > 0 && (
                            <div>
                                <h4 className="text-lg font-bold text-purple-500 mb-2 font-['Montserrat']">Terms & Conditions:</h4>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    {finalTerms.map((term, index) => (
                                        <li key={index}>{term}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Footer Section */}
                    <div className="p-8 pt-6 bg-purple-50 text-center text-gray-600 text-sm">
                        <div className="flex justify-center space-x-4 mb-3">
                            {studioData.website && (
                                <a href={`https://${studioData.website}`} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:underline">
                                    {studioData.website}
                                </a>
                            )}
                            {(studioData.socialLinks?.youtube || studioData.socialLinks?.instagram || studioData.socialLinks?.facebook) && (
                                <div className="flex justify-center space-x-3">
                                    {studioData.socialLinks?.youtube && (
                                        <a href={studioData.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-purple-500">
                                            <FaYoutube size={18} />
                                        </a>
                                    )}
                                    {studioData.socialLinks?.instagram && (
                                        <a href={studioData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-purple-500">
                                            <FaInstagram size={18} />
                                        </a>
                                    )}
                                    {studioData.socialLinks?.facebook && (
                                        <a href={studioData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-purple-500">
                                            <FaFacebook size={18} />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                        <p>&copy; {new Date().getFullYear()} {studioData.studioName}. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeElegant;