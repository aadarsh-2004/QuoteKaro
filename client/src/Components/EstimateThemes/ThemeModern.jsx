import React, { useRef, useState, useEffect } from "react";
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { FaShareAlt, FaDownload, FaArrowLeft, FaSpinner, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaPhone, FaEnvelope, FaGlobe, FaCreditCard, FaCamera } from "react-icons/fa";
import { useUser } from '../../context/UserContext'; // Adjust path if necessary

// Import the utility functions for S3 upload and database update
import { uploadPdfToS3Backend, updateEstimateInDb } from "../../Utils/pdfShareUtils"; // Adjust path as needed

const ThemeModern = ({ estimate, studio, onGoBack }) => {
    const { userData, loading: userLoading } = useUser();

    // State for managing the loading/feedback modal
    const [isProcessingPdf, setIsProcessingPdf] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [modalType, setModalType] = useState("loading"); // 'loading', 'success', 'error', 'info'

    // State to apply temporary styles for PDF capture
    const [captureStyles, setCaptureStyles] = useState({});

    // Ref for the DOM element to be converted to PDF
    const printRef = useRef(null);

    // Default data structure for preview/fallback
    const defaultQuotation = {
        _id: "QTN-PM-001", // Quotation ID
        clientName: "Emily Hana",
        location: "456 Client Street, Client town, ST 67890",
        phoneNumber: "(987) 654-3210",
        estimateDate: new Date("2024-07-19"),
        dueDate: new Date(new Date().setDate(new Date("2024-07-19").getDate() + 14)),
        description: "A detailed estimate for wedding photography services covering the ceremony and reception.",
        items: [
            { name: "Wedding Photography Session - 8 Hours", price: 1500, qty: 1, total: 1500 },
            { name: "Portrait Session - Studio Lighting Setup", price: 800, qty: 1, total: 800 },
            { name: "Event Coverage - Corporate Headshots (50 shots)", price: 1200, qty: 1, total: 1200 },
            { name: "Photo Editing & Retouching - Premium Package", price: 950, qty: 1, total: 950 }
        ],
        subtotal: 4450,
        discountType: "amount",
        discount: 0,
        tax: { percentage: 5, amount: 222.50 },
        total: 4672.50,
        paymentMethod: "Credit Card",
        notes: "A deposit of $500 is required to secure the booking.",
        termsAndConditions: [
            "All photos will be delivered within 7-10 business days via digital gallery",
            "High-resolution images included with full commercial usage rights",
            "Rush delivery available for additional fee - please contact studio for rates"
        ],
    };

    const defaultStudioDetails = {
        name: "Perfect Moment Photography Studio",
        brandName: "PHOTOGRAPHY STUDIO",
        tagline: "Capture Your Moments",
        logoUrl: null,
        phone: "(123) 456-7890",
        email: "info@perfectmoment.com",
        address: { d_address: "123 Photography Lane", city: "Amityville", state: "ST", pincode: "12345" },
        website: "www.photostudio.com",
        socialLinks: { youtube: null, instagram: null, facebook: null },
        policies: null,
        notes: null,
    };

    // Merge provided props with defaults
    const estimateData = { ...defaultQuotation, ...estimate };
    const studioDetails = { ...defaultStudioDetails, ...studio };

    // Recalculate totals based on items for accuracy
    const calculateTotals = () => {
        let calculatedSubtotal = estimateData.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
        let displayDiscountAmount = 0;

        if (estimateData.discountType === "percentage" && typeof estimateData.discount === 'number' && estimateData.discount > 0) {
            displayDiscountAmount = (calculatedSubtotal * estimateData.discount) / 100;
        } else if (estimateData.discountType === "amount" && typeof estimateData.discount === 'number' && estimateData.discount > 0) {
            displayDiscountAmount = estimateData.discount;
        }
        const amountAfterDiscount = calculatedSubtotal - displayDiscountAmount;

        let actualTaxAmount = 0;
        if (estimateData.tax) {
            if (typeof estimateData.tax.amount === 'number' && estimateData.tax.amount > 0) {
                actualTaxAmount = estimateData.tax.amount;
            } else if (typeof estimateData.tax.percentage === 'number' && estimateData.tax.percentage > 0) {
                actualTaxAmount = (amountAfterDiscount * estimateData.tax.percentage) / 100;
            }
        }
        let finalNetTotal = amountAfterDiscount + actualTaxAmount;

        return { calculatedSubtotal, displayDiscountAmount, actualTaxAmount, finalNetTotal };
    };

    const { calculatedSubtotal, displayDiscountAmount, actualTaxAmount, finalNetTotal } = calculateTotals();

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number' || isNaN(amount)) {
            return '$0.00';
        }
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    const formatDate = (date) => {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            return 'Invalid Date';
        }
        return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).toUpperCase().replace('.', '');
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
        setCaptureStyles({
            width: '210mm', // A4 width
            minHeight: '297mm', // A4 height (at least one page)
            position: 'absolute',
            left: '-9999px', // Move off-screen to avoid visual flicker during capture
            top: '-9999px',
            flexDirection: 'row', // Ensure flex items maintain row layout during capture
            alignItems: 'stretch', // Ensure equal height columns
            boxShadow: 'none', // Remove shadow for capture
            borderRadius: '0', // Remove border-radius for capture
            backgroundColor: '#FFFFFF', // Explicitly set background color for capture
            overflow: 'hidden', // Hide scrollbars
            '-webkit-print-color-adjust': 'exact', // Important for background images in html2canvas
            'print-color-adjust': 'exact',
        });

        // Wait for styles to apply (brief timeout)
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const canvas = await html2canvas(input, {
                scale: 3, // Higher scale for better resolution
                useCORS: true, // Important for images loaded from external sources (e.g., logoUrl, background)
                logging: false, // Disable html2canvas logging
                backgroundColor: null, // Let the element's background apply
                allowTaint: true, // Allow tainting for cross-origin if needed
                imageTimeout: 15000, // Longer timeout for images
                ignoreElements: (element) => {
                    return element.classList.contains('no-print'); // Ignore elements with this class
                },
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');

            const A4_WIDTH = 210; // A4 width in mm
            const A4_HEIGHT = 297; // A4 height in mm

            // Define desired margins in mm for the PDF content
            const PDF_MARGIN_X = 15; // Left/Right margin
            const PDF_MARGIN_Y = 15; // Top/Bottom margin

            const printableWidth = A4_WIDTH - (2 * PDF_MARGIN_X);
            const printableHeight = A4_HEIGHT - (2 * PDF_MARGIN_Y);

            const imgHeight = (canvas.height * printableWidth) / canvas.width;

            let heightLeft = imgHeight;
            let position = 0;

            let pageNum = 1;

            while (heightLeft > 0) {
                if (pageNum > 1) {
                    pdf.addPage();
                }

                let yOffset = -position;
                let sliceHeight = Math.min(printableHeight, heightLeft);

                pdf.addImage(
                    imgData, 'JPEG',
                    PDF_MARGIN_X, PDF_MARGIN_Y,
                    printableWidth, sliceHeight,
                    null, 'FAST', 0,
                    yOffset
                );

                heightLeft -= printableHeight;
                position += printableHeight;
                pageNum++;
            }

            return pdf.output('blob');

        } catch (error) {
            console.error("Error generating PDF Blob:", error);
            setModalMessage("Failed to generate PDF. Please try again.");
            setModalType("error");
            return null;
        } finally {
            // Restore original styles after canvas capture
            setCaptureStyles({});
        }
    };

    // --- Button Handlers ---
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
                a.download = `${estimateData.clientName}_Quotation_${estimateData._id}.pdf`;
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

            // Upload PDF to S3 via Backend
            const pdfUrl = await uploadPdfToS3Backend(
                pdfBlob,
                estimateData._id,
                estimateData.clientName,
                "Quotation",
                userData.firebaseUID, // Use userData.firebaseUID directly here
                setModalMessage,
                setModalType
            );
            if (!pdfUrl) {
                return;
            }

            // Update Estimate Model in MongoDB via Backend
            const dbUpdateSuccess = await updateEstimateInDb(
                estimateData._id,
                pdfUrl,
                userData.firebaseUID, // Use userData.firebaseUID directly here
                setModalMessage,
                setModalType
            );
            if (!dbUpdateSuccess) {
                return;
            }

            const shareTitle = `Quotation from ${studioDetails.name}`;
            const whatsappMessage = `Hi ${estimateData.clientName},\n\nHere's your estimate from ${studioDetails.name}:\n${pdfUrl}\n\nQuotation ID: ${estimateData._id}\n\nLooking forward to working with you!`;

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: shareTitle,
                        text: whatsappMessage,
                        url: pdfUrl,
                    });
                    console.log('Content shared successfully via Web Share API');
                    setModalMessage("Quotation shared successfully ✅");
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
                        if (estimateData.phoneNumber) {
                            window.open(`https://wa.me/${estimateData.phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                        }
                    }
                }
            } else {
                setModalMessage("Web Share API not supported. Opening WhatsApp directly.");
                setModalType("info");
                if (estimateData.phoneNumber) {
                    window.open(`https://wa.me/${estimateData.phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`, '_blank');
                }
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
            <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center max-w-sm text-center">
                    {icon && <div className={`mb-4 ${textColor}`}>{icon}</div>}
                    <p className="text-lg font-semibold text-gray-800">{message}</p>
                </div>
            </div>
        );
    };

    if (userLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-gray-600 text-lg">Loading user data...</div>
            </div>
        );
    }
    // Added a check for userData existence after loading to prevent issues if it's still null/undefined
    if (!userData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-600 text-lg">User data not available. Please try again.</div>
            </div>
        );
    }

    // Moved firebaseUID declaration after userData check
    const firebaseUID = userData.firebaseUID;

    // Determine terms and conditions for display
    const termsToDisplay = (studioDetails.policies && typeof studioDetails.policies === 'string' && studioDetails.policies.trim() !== '')
        ? studioDetails.policies.split('\n').map(term => term.trim()).filter(term => term !== '')
        : estimateData.termsAndConditions;

    return (
        <div className="min-h-screen bg-pink-100 p-4 flex flex-col items-center">
            {isProcessingPdf && <LoadingModal message={modalMessage} type={modalType} />}

            {/* Top Buttons Container - Excluded from PDF print */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-4 no-print p-2">
                <button
                    onClick={handleGoBack}
                    className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center text-gray-700"
                    aria-label="Go back"
                >
                    <FaArrowLeft size={20} />
                </button>
                <div className="flex space-x-3">
                    <button
                        onClick={handleShare}
                        className="p-2 px-4 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors text-white flex items-center justify-center text-sm"
                        aria-label="Share estimate"
                        disabled={isProcessingPdf}
                    >
                        <FaShareAlt className="mr-2" size={16} />
                        {isProcessingPdf && modalType === 'loading' ? " Sharing..." : " Share"}
                    </button>
                    <button
                        onClick={handleDownloadPdf}
                        className="p-2 px-4 rounded-full bg-green-500 hover:bg-green-600 transition-colors text-white flex items-center justify-center text-sm"
                        aria-label="Download PDF"
                        disabled={isProcessingPdf}
                    >
                        <FaDownload className="mr-2" size={16} />
                        {isProcessingPdf && modalType === 'loading' ? " Generating..." : " Download PDF"}
                    </button>
                </div>
            </div>

            {/* Main content container for preview and PDF generation */}
            <div
                className="mx-auto bg-white shadow-lg relative overflow-hidden"
                style={{
                    width: '210mm', // Fixed A4 width for display on all devices
                    minHeight: '297mm', // Ensure at least one A4 height for consistent preview
                    boxSizing: 'border-box', // Include padding in the width/height calculation
                    ...captureStyles // Apply dynamic styles for PDF capture
                }}
            >
                <div ref={printRef} className="p-8 print:p-8">
                    {/* Decorative elements - adjust positioning/sizing as needed */}
                    <div className="absolute top-0 left-0 -translate-x-6 -translate-y-6">
                        <div className="w-24 h-24 bg-orange-400 transform rotate-45"></div>
                        <div className="absolute top-4 left-4 w-16 h-1 bg-white transform rotate-45"></div>
                        <div className="absolute top-6 left-2 w-16 h-1 bg-white transform rotate-45"></div>
                        <div className="absolute top-8 left-0 w-16 h-1 bg-white transform rotate-45"></div>
                    </div>

                    {/* Photography decorative elements */}
                    <div className="absolute top-4 right-4 opacity-10 z-0">
                        <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4,4H7L9,2H15L17,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4A2,2 0 0,1 2,18V6A2,2 0 0,1 4,4M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9Z"/>
                        </svg>
                    </div>

                    {/* Flash/burst decorative element */}
                    <div className="absolute top-20 right-8 opacity-20 z-0">
                        <div className="relative">
                            <div className="w-3 h-8 bg-yellow-300 transform rotate-12"></div>
                            <div className="w-3 h-8 bg-yellow-300 transform -rotate-12 absolute top-0"></div>
                            <div className="w-8 h-3 bg-yellow-300 transform rotate-45 absolute top-2 -left-2"></div>
                            <div className="w-8 h-3 bg-yellow-300 transform -rotate-45 absolute top-2 -left-2"></div>
                        </div>
                    </div>

                    {/* Header */}
                    <div className="flex justify-between items-start p-0 pb-4 relative z-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                {/* Studio Logo/Icon */}
                                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                                    {studioDetails.logoUrl ? (
                                        <img src={studioDetails.logoUrl} alt="Studio Logo" className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <FaCamera className="w-8 h-8 text-white" />
                                    )}
                                </div>
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                    <div className="w-4 h-4 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                                📸 {studioDetails.brandName || studioDetails.name}
                            </div>
                            <div className="text-blue-600 text-2xl font-bold">QUOTATION</div>
                            <div className="text-orange-500 font-bold"># {estimateData._id}</div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                            <div className="font-semibold mb-1">QUOTATION DATE:</div>
                            <div>{formatDate(estimateData.estimateDate)}</div>
                            <div className="font-semibold mb-1 mt-2">DUE DATE:</div>
                            <div>{formatDate(estimateData.dueDate)}</div>
                        </div>
                    </div>

                    {/* Billing Information */}
                    <div className="px-0 pb-4 relative z-10">
                        <div className="bg-blue-600 text-white p-3 rounded">
                            <div className="font-semibold mb-1">BILLING TO:</div>
                            <div className="text-sm">{estimateData.clientName}</div>
                            {estimateData.location && <div className="text-xs">{estimateData.location}</div>}
                        </div>
                    </div>

                    {/* Quotation Items Table */}
                    <div className="px-0 pb-4 relative z-10">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-2 text-sm font-semibold text-gray-700">ITEM NAME</th>
                                    <th className="text-center py-2 text-sm font-semibold text-gray-700">PRICE</th>
                                    <th className="text-center py-2 text-sm font-semibold text-gray-700">QTY</th>
                                    <th className="text-right py-2 text-sm font-semibold text-gray-700">TOTAL</th>
                                </tr>
                            </thead>
                            <tbody>
                                {estimateData.items.length > 0 ? (
                                    estimateData.items.map((item, index) => (
                                        <tr key={index} className="border-b border-gray-100">
                                            <td className="py-3 pr-4 text-xs text-gray-600">{item.name}</td>
                                            <td className="py-3 text-center text-xs text-gray-700">{formatCurrency(item.price)}</td>
                                            <td className="py-3 text-center text-xs text-gray-700">{item.qty}</td>
                                            <td className="py-3 text-right text-xs text-gray-700">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td className="py-3 pr-4 text-xs text-gray-600" colSpan="4">No items listed</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Payment Summary */}
                    <div className="px-0 pb-4 relative z-10">
                        <div className="text-orange-500 font-bold mb-2">Payment Summary</div> {/* Changed from Payment Method */}
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Subtotal:</span>
                            <span className="text-sm font-semibold">{formatCurrency(calculatedSubtotal)}</span>
                        </div>
                        {displayDiscountAmount > 0 && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Discount:</span>
                                <span className="text-sm font-semibold">-{formatCurrency(displayDiscountAmount)}</span>
                            </div>
                        )}
                        {estimateData.tax && (estimateData.tax.percentage > 0 || estimateData.tax.amount > 0) && (
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Tax {estimateData.tax.percentage > 0 ? `(${estimateData.tax.percentage}%)` : ''}:</span>
                                <span className="text-sm font-semibold">{formatCurrency(actualTaxAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center mt-4 border-t-2 border-gray-200 pt-2">
                            <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold flex items-center gap-1">
                                <FaCreditCard /> {estimateData.paymentMethod}
                            </div>
                            <span className="text-lg font-bold">TOTAL: {formatCurrency(finalNetTotal)}</span>
                        </div>
                    </div>

                    {/* Notes */}
                    {estimateData.notes && estimateData.notes.trim() !== '' && (
                        <div className="px-0 pb-4 relative z-10">
                            <div className="text-orange-500 font-bold mb-2">Notes</div>
                            <p className="text-xs text-gray-600">{estimateData.notes}</p>
                        </div>
                    )}


                    {/* Terms and Conditions */}
                    <div className="px-0 pb-6 relative z-10">
                        <div className="text-orange-500 font-bold mb-2">Terms and Conditions</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                            {termsToDisplay.length > 0 ? (
                                termsToDisplay.map((term, index) => (
                                    <li key={index} className="flex items-start">
                                        <span className="text-orange-500 mr-2">
                                            {index === 0 ? '📸' : index === 1 ? '🎯' : '⚡'}
                                        </span>
                                        {term}
                                    </li>
                                ))
                            ) : (
                                <li>No specific terms and conditions provided.</li>
                            )}
                        </ul>
                    </div>

                    {/* Footer / Contact Information */}
                    <div className="px-0 pt-4 border-t border-gray-200 relative z-10 flex justify-between items-end">
                        <div className="text-xs text-gray-600 space-y-1">
                            {studioDetails.phone && (
                                <div className="flex items-center gap-2">
                                    <FaPhone className="text-orange-500" />
                                    <span>{studioDetails.phone}</span>
                                </div>
                            )}
                            {studioDetails.email && (
                                <div className="flex items-center gap-2">
                                    <FaEnvelope className="text-orange-500" />
                                    <span>{studioDetails.email}</span>
                                </div>
                            )}
                            {studioDetails.website && (
                                <div className="flex items-center gap-2">
                                    <FaGlobe className="text-orange-500" />
                                    <span>{studioDetails.website}</span>
                                </div>
                            )}
                            {studioDetails.address && (studioDetails.address.d_address || studioDetails.address.city) && (
                                <div className="flex items-start gap-2">
                                    <svg className="h-4 w-4 text-orange-500 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0C7.8 0 4.4 3.4 4.4 7.6c0 4.2 7.6 14.4 7.6 14.4s7.6-10.2 7.6-14.4C19.6 3.4 16.2 0 12 0zm0 10.4c-1.5 0-2.8-1.3-2.8-2.8s1.3-2.8 2.8-2.8 2.8 1.3 2.8 2.8-1.3 2.8-2.8 2.8z"/>
                                    </svg>
                                    <span>
                                        {studioDetails.address.d_address && <div>{studioDetails.address.d_address}</div>}
                                        {studioDetails.address.city && <div>{studioDetails.address.city}, {studioDetails.address.state} {studioDetails.address.pincode}</div>}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="text-right text-xs text-gray-700">
                            Thank you for your business!
                        </div>
                    </div>

                    {/* Bottom Decorative elements */}
                    <div className="absolute bottom-0 right-0 translate-x-6 translate-y-6">
                        <div className="w-24 h-24 bg-blue-600 transform -rotate-45"></div>
                        <div className="absolute bottom-4 right-4 w-16 h-1 bg-white transform -rotate-45"></div>
                        <div className="absolute bottom-6 right-2 w-16 h-1 bg-white transform -rotate-45"></div>
                        <div className="absolute bottom-8 right-0 w-16 h-1 bg-white transform -rotate-45"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeModern;