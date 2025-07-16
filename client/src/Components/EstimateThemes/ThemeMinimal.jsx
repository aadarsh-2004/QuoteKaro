import React, { useRef } from "react"; // Import useRef hook
import html2canvas from 'html2canvas-pro'; // Import html2canvas
import jsPDF from 'jspdf'; // Import jsPDF
import { FaYoutube, FaInstagram, FaFacebook, FaPhone, FaEnvelope, FaMapMarkerAlt, FaShareAlt, FaDownload, FaArrowLeft } from "react-icons/fa"; // Import new icons

const ThemeMinimal = ({ estimate, studio, onGoBack }) => { // Added onGoBack prop
  // `studio` prop represents your User model data
  console.log("Studio (User) Data:", studio);
  console.log("Estimate Data:", estimate);

  // Ref for the content to be converted to PDF
  const printRef = useRef(null);

  const defaultEstimate = {
    _id: "ES-0269",
    clientName: "Emily Hana",
    functionName: "Wedding Photography Estimate",
    location: "456 Client Street, Client town, ST 67890",
    phoneNumber: "(987) 654-3210",
    startDate: new Date("2029-01-30"),
    endDate: null, // Added endDate for potential use
    description: "A detailed estimate for wedding photography services covering the ceremony and reception.", // Added description
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
    tax: undefined,
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
      pincode: "12345"
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
  if (studioData.policies && typeof studioData.policies === 'string' && studioData.policies.trim() !== '') {
    finalTerms = studioData.policies.split('\n').map(term => term.trim()).filter(term => term !== '');
  } else if (estimateData.terms && Array.isArray(estimateData.terms) && estimateData.terms.length > 0) {
    finalTerms = estimateData.terms;
  }

  let displayDiscount = 0;
  let discountDescription = "";

  if (estimateData.discountType === "percentage" && typeof estimateData.discount === 'number' && estimateData.discount > 0) {
    displayDiscount = (estimateData.subtotal * estimateData.discount) / 100;
    discountDescription = `${estimateData.discount}%`;
  } else if (estimateData.discountType === "amount" && typeof estimateData.discount === 'number' && estimateData.discount > 0) {
    displayDiscount = estimateData.discount;
    discountDescription = "";
  }

  let calculatedNetTotal = estimateData.subtotal - displayDiscount;
  if (typeof estimateData.tax === 'number' && estimateData.tax > 0) {
      calculatedNetTotal += estimateData.tax;
  }

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

  // --- Button Handlers ---

  const handleDownloadPdf = async () => {
    const input = printRef.current;
    if (!input) {
      console.error("Element for PDF conversion not found.");
      return;
    }

    // Set a temporary fixed width for html2canvas to ensure consistent rendering
    // This is crucial for consistent PDF output regardless of screen size during preview
    const originalWidth = input.style.width;
    const originalHeight = input.style.height;
    const originalPosition = input.style.position;
    const originalLeft = input.style.left;

    // Apply temporary styles to the element for PDF capture
    input.style.width = '210mm'; // A4 width
    input.style.height = 'auto'; // Let height adjust naturally
    input.style.position = 'absolute'; // Prevent layout shifts during capture
    input.style.left = '-9999px'; // Move off-screen

    try {
      const canvas = await html2canvas(input, {
        scale: 2, // Increase scale for better resolution in PDF
        useCORS: true, // Important for images loaded from external sources
        logging: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // 'p' for portrait, 'mm' for millimeters, 'a4' for A4 size

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${estimateData.functionName}_${estimateData.clientName}_Estimate.pdf`);

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again."); // Using alert as a fallback, consider a custom modal
    } finally {
      // Restore original styles
      input.style.width = originalWidth;
      input.style.height = originalHeight;
      input.style.position = originalPosition;
      input.style.left = originalLeft;
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${estimateData.functionName} Estimate for ${estimateData.clientName}`,
          text: `Check out this estimate from ${studioData.name} for ${estimateData.functionName}. Total: ${formatCurrency(calculatedNetTotal)}`,
          url: window.location.href, // Shares the current page URL
        });
        console.log('Content shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
        // User cancelled share or other error
      }
    } else {
      // Fallback for browsers that do not support Web Share API
      alert("Web Share API is not supported in this browser. You can manually copy the URL."); // Consider a custom modal
      console.log("Web Share API not supported.");
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack(); // Use the prop if provided
    } else {
      window.history.back(); // Fallback to browser history
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      {/* Top Buttons Container - Excluded from PDF print */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-4 no-print">
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
            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition-colors text-white flex items-center justify-center"
            aria-label="Share estimate"
          >
            <FaShareAlt size={20} />
          </button>
          <button
            onClick={handleDownloadPdf}
            className="p-2 rounded-full bg-green-500 hover:bg-green-600 transition-colors text-white flex items-center justify-center"
            aria-label="Download PDF"
          >
            <FaDownload size={20} />
          </button>
        </div>
      </div>

      {/* Main content container for preview and PDF generation */}
      {/* Added ref for PDF conversion */}
      {/* Added responsive classes for preview: max-w-4xl on desktop, full width on mobile */}
      <div ref={printRef} className="w-full max-w-4xl mx-auto font-sans text-gray-900 bg-white shadow-lg rounded-lg overflow-hidden md:shadow-none md:rounded-none print-a4-document-wrapper">
        <div className="flex flex-col md:flex-row"> {/* Added flex-col for mobile, flex-row for desktop */}
          {/* Left Section (Image and Contact Info) */}
          {/* Adjusted width for responsiveness */}
          <div
            className="relative w-full md:w-1/3 bg-cover bg-center left-panel-print min-h-[300px] md:min-h-0" // min-h for mobile visibility
            style={{
              backgroundImage: `url('/couplephoto.jpg')`,
            }}
          >
            <div className="relative z-10 flex flex-col h-full text-white p-6"> {/* Reduced padding for mobile */}
              <div className="flex flex-col items-center mb-8 mt-8">
                {/* Logo or Studio Initial */}
                {studioData.logoUrl ? (
                  <div className="mb-2">
                    <img
                      src={studioData.logoUrl}
                      alt="Studio Logo"
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover" // Responsive logo size
                    />
                  </div>
                ) : (
                  <div className="mb-2 w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gray-700 flex items-center justify-center">
                    <span className="text-5xl sm:text-6xl font-bold uppercase"> {/* Responsive initial size */}
                      {studioData.studioName ? studioData.studioName.charAt(0) : "S"}
                    </span>
                  </div>
                )}
                {/* {studioData.studioName && (
                  <h2 className="text-lg sm:text-xl font-semibold uppercase tracking-wider text-center mt-4">{studioData.studioName}</h2>
                )} */}
              </div>

              {/* Contact Us */}
              <div className="mt-auto p-4 rounded-md bg-black/50 text-sm"> {/* Reduced padding and font size for mobile */}
                <h3 className="text-base sm:text-lg font-bold mb-3 uppercase">Contact Us</h3> {/* Responsive heading size */}

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
                      {studioData.address.d_address && <span>{studioData.address.d_address}<br/></span>}
                      {studioData.address.city && <span>{studioData.address.city}, </span>}
                      {studioData.address.state && <span>{studioData.address.state}</span>}
                      {studioData.address.pincode && <span> - {studioData.address.pincode}</span>}
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

                {studioData.socialLinks && (studioData.socialLinks.youtube || studioData.socialLinks.instagram || studioData.socialLinks.facebook) && (
                  <div className="flex space-x-3 mt-4"> {/* Adjusted space-x for mobile */}
                    {studioData.socialLinks.youtube && (
                      <a
                        href={studioData.socialLinks.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-red-500 transition-colors duration-200"
                      >
                        <FaYoutube size={20} /> {/* Responsive icon size */}
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
          {/* Adjusted width for responsiveness */}
          <div className="w-full md:w-2/3 p-6 sm:p-12 right-panel-print"> {/* Reduced padding for mobile */}
            {/* IMPROVED HEADER SECTION */}
            <div className="flex flex-col items-center mb-6 sm:mb-8"> {/* Reduced margin-bottom */}
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-1 sm:mb-2 text-center uppercase"> {/* Responsive font size */}
                {studioData.studioName}
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-4 sm:mb-6 text-center"> {/* Responsive font size */}
                {estimateData.functionName} 
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 w-full"> {/* Stack columns on mobile */}
                {/* Left Column: Estimate Details */}
                <div className="text-left text-sm sm:text-base mb-4 sm:mb-0"> {/* Responsive font size and margin */}
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Event Type:</span> {estimateData.functionName}
                  </p>
                  {estimateData.startDate && (
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Event Dates:</span> {formatDate(estimateData.startDate)}
                      {estimateData.endDate && ` - ${formatDate(estimateData.endDate)}`}
                    </p>
                  )}
                  {estimateData.location && (
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Location:</span> {estimateData.location}
                    </p>
                  )}
                  {estimateData.description && (
                    <p className="text-gray-700 mb-1 break-words">
                      <span className="font-semibold">Description:</span> {estimateData.description}
                    </p>
                  )}
                </div>

                {/* Right Column: Client Details */}
                <div className="text-left sm:text-right text-sm sm:text-base"> {/* Responsive text alignment and font size */}
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Client Name:</span> {estimateData.clientName}
                  </p>
                  {estimateData.phoneNumber && (
                    <p className="text-gray-700 mb-1">
                      <span className="font-semibold">Phone:</span> {estimateData.phoneNumber}
                    </p>
                  )}
                  <p className="text-gray-700 mb-1">
                    <span className="font-semibold">Estimate Date:</span> {formatDate(new Date())}
                  </p>
                </div>
              </div>
            </div>
            {/* END IMPROVED HEADER SECTION */}

            {/* Services Table */}
            <div className="mb-6 sm:mb-8"> {/* Adjusted margin-bottom */}
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-800 text-white text-left">
                      <th className="py-2 px-3 text-xs sm:py-3 sm:px-4 sm:text-sm font-semibold uppercase"> {/* Responsive padding/font size */}
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
            <div className="flex flex-col items-end w-full mb-6 sm:mb-12"> {/* Adjusted margin-bottom */}
              <div className="w-full sm:w-1/2"> {/* Full width on mobile, half on desktop */}
                <div className="flex justify-between py-1 sm:py-2 border-b border-gray-200 text-sm sm:text-base"> {/* Responsive padding/font size */}
                  <span className="text-gray-700 font-semibold">Subtotal:</span>
                  <span className="text-gray-900 font-semibold">{formatCurrency(estimateData.subtotal)}</span>
                </div>
                {displayDiscount > 0 && (
                  <div className="flex justify-between py-1 sm:py-2 border-b border-gray-200 text-sm sm:text-base">
                    <span className="text-gray-700 font-semibold">
                      Discount
                      {discountDescription && ` (${discountDescription})`}
                      :
                    </span>
                    <span className="text-red-500 font-semibold">- {formatCurrency(displayDiscount)}</span>
                  </div>
                )}
                {estimateData.tax !== undefined && estimateData.tax > 0 && (
                  <div className="flex justify-between py-1 sm:py-2 border-b border-gray-200 text-sm sm:text-base">
                    <span className="text-gray-700 font-semibold">Tax:</span>
                    <span className="text-gray-900 font-semibold">{formatCurrency(estimateData.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 sm:py-3 border-t-2 border-gray-400 mt-2 sm:mt-4 text-base sm:text-xl"> {/* Responsive font size */}
                  <span className="font-bold text-gray-800 uppercase">Grand Total:</span>
                  <span className="font-bold text-gray-800">{formatCurrency(calculatedNetTotal)}</span>
                </div>
              </div>
            </div>

            {/* Additional Notes - Always take from estimateData as requested */}
            {finalNotes && (
              <div className="mb-6 sm:mb-8"> {/* Adjusted margin-bottom */}
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">
                  Additional Notes:
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 sm:space-y-2 break-words text-sm sm:text-base"> {/* Responsive font size and spacing */}
                  <li>
                    <span className="font-semibold">{finalNotes}</span>
                  </li>
                </ul>
              </div>
            )}

            {/* Terms and Conditions (Policies) - From studioData.policies or fallback to estimateData.terms */}
            {finalTerms && finalTerms.length > 0 && (
              <div className="mb-6 sm:mb-8"> {/* Adjusted margin-bottom */}
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3">
                  Terms and Conditions:
                </h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 sm:space-y-2 break-words text-sm sm:text-base"> {/* Responsive font size and spacing */}
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