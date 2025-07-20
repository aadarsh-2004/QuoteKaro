import React, { useRef, useState } from "react";
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { FaShareAlt, FaDownload, FaArrowLeft, FaPhone, FaEnvelope, FaMapMarkerAlt, FaYoutube, FaInstagram, FaFacebook, FaSpinner, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaLaptopCode } from "react-icons/fa"; // Added FaLaptopCode for branding
import { Camera, ImageIcon, BookOpen } from "lucide-react";
import { useUser } from '../../context/UserContext';

// Import the utility functions for S3 upload and database update
import { uploadPdfToS3Backend, updateEstimateInDb } from "../../Utils/pdfShareUtils";

// Import fonts (consider if you're globally importing or need specific imports)
import '@fontsource/inter'; // A modern, professional sans-serif font
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import ChooseTemplateBtn from "../../Utils/ChooseTemplateBtn";
// You might not need Playfair Display if going for a pure sans-serif look
// import '@fontsource/playfair-display';

const ThemeSimple = ({ estimate, studio, onGoBack }) => {
    const { userData, loading: userLoading } = useUser();

    const [isProcessingPdf, setIsProcessingPdf] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("loading");
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

    // Default data structure for preview/fallback
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
        name: "Perfect Moment Studio", // Updated default name
        phone: "(123) 456-7890",
        email: "info@perfectmoment.com",
        address: { d_address: "123 Business Park", city: "Metropolis", state: "NY", pincode: "10001" },
        logoUrl: null, // Placeholder for your logo URL
        website: "www.perfectmoment.com",
        socialLinks: { youtube: null, instagram: "https://instagram.com/perfectmoment", facebook: null },
        policies: "All services require a 50% upfront deposit. Final payment is due upon delivery. Rescheduling must be done 7 days in advance. Late payments may incur interest charges.",
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
        // Simple, professional icons - can adjust as needed
        if (serviceName.toLowerCase().includes("coverage") || serviceName.toLowerCase().includes("photography")) {
            return <Camera className="w-4 h-4 text-blue-600" />;
        }
        if (serviceName.toLowerCase().includes("engagement") || serviceName.toLowerCase().includes("session")) {
            return <ImageIcon className="w-4 h-4 text-blue-600" />;
        }
        if (serviceName.toLowerCase().includes("album") || serviceName.toLowerCase().includes("prints")) {
            return <BookOpen className="w-4 h-4 text-blue-600" />;
        }
        return <Camera className="w-4 h-4 text-blue-600" />;
    };

    // --- PDF Generation Logic (Reused from ThemeVintage) ---
    const generatePdfBlobFromCurrentView = async () => {
        setIsProcessingPdf(true);
        setModalMessage("Generating PDF...");
        setModalType("loading");
        const input = printRef.current;
        if (!input) {
            console.error("Element for PDF conversion not found.");
            setModalMessage("Error: PDF element not found.");
            setModalType("error");
            return null;
        }

        setCaptureStyles({
            width: '210mm', // A4 width
            position: 'absolute',
            left: '-9999px', // Move off-screen to avoid visual flicker during capture
            top: '-9999px',
            boxShadow: 'none',
            borderRadius: '0',
            backgroundColor: '#ffffff', // Ensure white background for PDF
            WebkitPrintColorAdjust: 'exact',
            colorAdjust: 'exact',
            margin: '0', // Ensure no unwanted margins are added
            padding: '0' // Ensure no unwanted padding
        });

        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const canvas = await html2canvas(input, {
                scale: 1.5,
                useCORS: true,
                logging: false,
                backgroundColor: null,
                allowTaint: true,
                imageTimeout: 15000,
                ignoreElements: (element) => {
                    return element.classList.contains('no-print');
                },
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            return pdf.output('blob');

        } catch (error) {
            console.error("Error generating PDF Blob:", error);
            setModalMessage("Failed to generate PDF. Please try again.");
            setModalType("error");
            return null;
        } finally {
            setCaptureStyles({});
        }
    };

    // --- Button Handlers (Reused from ThemeVintage) ---
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
        if (!message) return null;

        let icon;
        let textColor;
        switch (type) {
            case 'loading':
                icon = <FaSpinner className="animate-spin text-4xl" />;
                textColor = "text-blue-600"; // Accent color for loading
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
        <div className="min-h-screen bg-white p-4 sm:p-6 flex flex-col items-center font-['Inter']">
            {isProcessingPdf && <LoadingModal message={modalMessage} type={modalType} />}

            <div className="w-full max-w-4xl flex justify-between items-center mb-4 no-print p-4 sm:p-0">
        <button
          onClick={handleGoBack}
          className="p-2   rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-700"
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
                className="pl-48 md:p-0 w-[210mm] mx-auto bg-white text-gray-800 shadow-md rounded-lg overflow-hidden flex flex-col" // Changed to flex-col for stack layout
                style={captureStyles}
            >
                {/* Header Section */}
                <div className="bg-gray-50 p-8 pb-6 border-b border-gray-200 flex justify-between items-start">
                    <div className="flex flex-col items-start">
                        {studioData.logoUrl ? (
                            <img src={studioData.logoUrl} alt="Studio Logo" className="h-16 w-auto object-contain mb-3" />
                        ) : (
                            <div className="h-16 w-16 flex items-center justify-center text-4xl font-bold text-blue-600 bg-blue-50 rounded-full border-2 border-blue-200 mb-3">
                                {studioData.studioName ? studioData.studioName.charAt(0).toUpperCase() : "S"}
                            </div>
                        )}
                        <h1 className="text-3xl font-extrabold text-gray-800 mb-1">
                            {studioData.studioName}
                        </h1>
                        <div className="text-sm text-gray-600">
                            {studioData.address.d_address}, {studioData.address.city}, {studioData.address.state}, {studioData.address.pincode}
                        </div>
                    </div>

                    <div className="text-right mt-4">
                        <h2 className="text-4xl font-bold text-blue-600 mb-2">ESTIMATE</h2>
                        <p className="text-sm text-gray-600 mb-1">ID: <span className="font-semibold text-gray-700">{estimateData._id}</span></p>
                        <p className="text-sm text-gray-600 mb-1">Date: <span className="font-semibold text-gray-700">{formatDate(new Date())}</span></p>
                    </div>
                </div>

                {/* Client Information Section */}
                <div className="p-8 py-6 border-b border-gray-200">
                    <h3 className="text-lg font-bold text-gray-700 mb-3">Estimate For</h3>
                    <p className="text-md font-semibold text-gray-800">{estimateData.clientName}</p>
                    <p className="text-sm text-gray-600">{estimateData.functionName}</p>
                    {estimateData.location && (
                        <p className="text-xs text-gray-500 flex items-center mt-1"><FaMapMarkerAlt className="mr-2" />{estimateData.location}</p>
                    )}
                    {estimateData.startDate && (
                        <p className="text-xs text-gray-500 mt-1">
                            Dates: {formatDate(estimateData.startDate)}
                            {estimateData.endDate && ` - ${formatDate(estimateData.endDate)}`}
                        </p>
                    )}
                    {estimateData.phoneNumber && (
                        <p className="text-xs text-gray-500 flex items-center mt-1"><FaPhone className="mr-2" />{estimateData.phoneNumber}</p>
                    )}
                </div>

                {/* Services Table Section */}
                <div className="p-8 flex-grow">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-blue-50 text-blue-700 uppercase text-xs">
                                <th className="py-3 px-4 rounded-tl-md">Service</th>
                                <th className="py-3 px-4">Description</th>
                                <th className="py-3 px-4 text-right rounded-tr-md">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {estimateData.services.map((service, index) => (
                                <tr key={index} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="py-3 px-4 flex items-center font-medium text-gray-800">
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
                            <div className="flex justify-between items-center py-2 border-t border-gray-200">
                                <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                                <span className="text-sm font-medium text-gray-800">{formatCurrency(estimateData.subtotal)}</span>
                            </div>

                            {displayDiscountAmount > 0 && (
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm font-medium text-red-500">Discount {discountDescription ? `(${discountDescription})` : ''}:</span>
                                    <span className="text-sm font-medium text-red-500">- {formatCurrency(displayDiscountAmount)}</span>
                                </div>
                            )}

                            {actualTaxAmount > 0 && (
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-sm font-medium text-gray-700">Tax ({estimateData.tax.percentage}%):</span>
                                    <span className="text-sm font-medium text-gray-800">{formatCurrency(actualTaxAmount)}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-3 mt-4 bg-blue-600 text-white rounded-md px-4">
                                <span className="text-lg font-bold">TOTAL:</span>
                                <span className="text-lg font-bold">{formatCurrency(calculatedNetTotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes and Terms */}
                <div className="p-8 pt-4 border-t border-gray-200">
                    {finalNotes && (
                        <div className="mb-6">
                            <h4 className="text-md font-bold text-gray-700 mb-2">Notes:</h4>
                            <p className="text-sm text-gray-600 leading-relaxed">{finalNotes}</p>
                        </div>
                    )}

                    {finalTerms.length > 0 && (
                        <div>
                            <h4 className="text-md font-bold text-gray-700 mb-2">Terms & Conditions:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                {finalTerms.map((term, index) => (
                                    <li key={index}>{term}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Footer Section - Contact and Branding */}
                <div className="bg-gray-800 text-white p-8 pt-6 text-center text-sm rounded-b-lg">
                    <div className="flex justify-center space-x-6 mb-3">
                        {studioData.website && (
                            <a href={`https://${studioData.website}`} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:underline flex items-center">
                                <FaLaptopCode className="mr-2" /> {studioData.website}
                            </a>
                        )}
                        {studioData.email && (
                            <a href={`mailto:${studioData.email}`} className="text-blue-300 hover:underline flex items-center">
                                <FaEnvelope className="mr-2" /> {studioData.email}
                            </a>
                        )}
                        {studioData.phone && (
                            <a href={`tel:${studioData.phone}`} className="text-blue-300 hover:underline flex items-center">
                                <FaPhone className="mr-2" /> {studioData.phone}
                            </a>
                        )}
                    </div>
                    {(studioData.socialLinks?.youtube || studioData.socialLinks?.instagram || studioData.socialLinks?.facebook) && (
                        <div className="flex justify-center space-x-4 mb-3">
                            {studioData.socialLinks?.youtube && (
                                <a href={studioData.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white">
                                    <FaYoutube size={20} />
                                </a>
                            )}
                            {studioData.socialLinks?.instagram && (
                                <a href={studioData.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white">
                                    <FaInstagram size={20} />
                                </a>
                            )}
                            {studioData.socialLinks?.facebook && (
                                <a href={studioData.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white">
                                    <FaFacebook size={20} />
                                </a>
                            )}
                        </div>
                    )}
                    <p className="text-gray-400">&copy; {new Date().getFullYear()} {studioData.studioName}. All rights reserved.</p>
                    <div className="mt-4 text-xs text-gray-500 flex items-center justify-center">
                        <span className="mr-2">Made by</span>
                        <FaLaptopCode className="text-blue-400 mr-1" />
                        <span className="font-semibold text-blue-300">QuoteKaro</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeSimple;