import React, { useRef } from "react";
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { FaShareAlt, FaDownload, FaArrowLeft, FaPhone, FaEnvelope, FaMapMarkerAlt, FaYoutube, FaInstagram, FaFacebook } from "react-icons/fa";
import { Camera, ImageIcon, BookOpen } from "lucide-react";

import '@fontsource/montserrat';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';




const ThemeVintage = ({ estimate, studio, onGoBack }) => {
  const printRef = useRef(null);

  const defaultEstimate = {
    _id: "EST-2024-001",
    clientName: "Riley Williams",
    functionName: "Wedding Photography",
    location: "Mumbai, Maharashtra",
    startDate: new Date("2024-07-15"),
    endDate: new Date("2024-07-16"),
    phoneNumber: "+91 98765 43210",
    description: "A comprehensive wedding photography package covering pre-wedding, ceremony, and reception.",
    services: [
      {
        serviceName: "Full-Day Coverage",
        description: "Up to 12 hours of coverage capturing all the moments.",
        total: 50000,
      },
      {
        serviceName: "Engagement Session",
        description: "2-hour engagement photo session at a location of your choice with 50 edited images.",
        total: 15000,
      },
      {
        serviceName: "Luxury Album",
        description: "20-page personalized photo album of high-quality prints with custom design.",
        total: 20000,
      },
      {
        serviceName: "Photo Booth",
        description: "Interactive photo booth with props and instant prints for 3 hours.",
        total: 10000,
      },
    ],
    
    
    
    tax: {
      percentage: 18,
      amount: 0,
    },
    netTotal: 0, // Default to 0, will be calculated or overridden by prop
    notes: "A 20% advance payment is required to confirm the booking.",
    terms: [
      "Final payment is due 7 days prior to the event.",
      "Cancellations made less than 30 days before the event will forfeit the advance payment.",
    ],
  };

  const estimateData = { ...defaultEstimate, ...estimate };
  const studioData = {
    name: "CREATIVE STUDIO J", // Corrected
    logoUrl: "",
    phone: "(123) 456-7890",
    email: "info@creativestudioj.com",
    address: {
      d_address: "123 Studio Lane",
      city: "Artville",
      state: "CA",
      pincode: "90210"
    },
    website: "www.creativestudioj.com",
    socialLinks: { youtube: null, instagram: null, facebook: null },
    policies: "All services are subject to a standard contract. Photography raw files are not included in any package.",
    ...studio,
  };

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
      return <Camera className="w-8 h-8" />;
    }
    if (serviceName.toLowerCase().includes("engagement") || serviceName.toLowerCase().includes("session")) {
      return <ImageIcon className="w-8 h-8" />;
    }
    if (serviceName.toLowerCase().includes("album") || serviceName.toLowerCase().includes("prints")) {
      return <BookOpen className="w-8 h-8" />;
    }
    return <Camera className="w-8 h-8" />;
  };

  // --- Start of Revised Calculation Logic ---

  let displayDiscountAmount = 0;
  let discountDescription = "";

  if (estimateData.discountType === "percentage" && typeof estimateData.discount === 'number' && estimateData.discount > 0) {
    // Calculate discount amount from percentage
    displayDiscountAmount = (estimateData.subtotal * estimateData.discount) / 100;
    discountDescription = `${estimateData.discount}%`;
  } else if (estimateData.discountType === "amount" && typeof estimateData.discount === 'number' && estimateData.discount > 0) {
    // Use discount amount directly
    displayDiscountAmount = estimateData.discount;
    discountDescription = `-${formatCurrency(estimateData.discount)}`;
  }

  // Calculate amount after subtotal and discount
  const amountAfterDiscount = estimateData.netTotal 

  

  // Calculate final net total based on current display logic
  let calculatedNetTotal = amountAfterDiscount ;

  // --- End of Revised Calculation Logic ---

  const handleDownloadPdf = async () => {
    const input = printRef.current;
    if (!input) {
      console.error("Element for PDF conversion not found.");
      return;
    }

    const originalStyle = input.style.cssText;

    // These inline styles are crucial for html2canvas to render correctly for PDF.
    // Removed 'overflow: hidden' to ensure all content is captured for multi-page PDFs.
    input.style.width = '210mm';
    input.style.minHeight = '297mm';
    input.style.margin = '0 auto';
    input.style.boxShadow = 'none';
    input.style.borderRadius = '0';
    // input.style.overflow = 'hidden'; // Removed this line

    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        logging: false,
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

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${estimateData.functionName}_${estimateData.clientName}_Estimate.pdf`);
      alert("PDF downloaded successfully!");

    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please ensure all content is loaded and try again.");
    } finally {
      if (input) {
        input.style.cssText = originalStyle;
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${estimateData.functionName} Estimate for ${estimateData.clientName}`,
          text: `Check out this estimate from ${studioData.name} for ${estimateData.functionName}. Total: ${formatCurrency(calculatedNetTotal)}`,
          url: window.location.href,
        });
        console.log('Content shared successfully');
      } catch (error) {
        console.error('Error sharing:', error);
        alert("Failed to share. You can manually copy the URL.");
      }
    } else {
      alert("Web Share API is not supported in this browser. You can manually copy the URL.");
      navigator.clipboard.writeText(window.location.href).then(() => {
        console.log('URL copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy URL to clipboard:', err);
      });
    }
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl flex justify-between items-center mb-4 no-print">
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

      <div
        ref={printRef}
        className="w-full max-w-2xl mx-auto bg-[#F5F1E8] p-12 font-['Montserrat'] text-gray-800 shadow-lg rounded-lg
                   print-a4-document-wrapper"
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
            {/* Corrected to studioData.name */}
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

              

              {/* Grand Total Row */}
              <tr className="bg-[#F0EBE0] border-t-2 border-[#8B7355]">
                <td className="py-4 px-6 font-bold text-xl print:py-2 print:px-3 print:text-lg">Total</td>
                <td className="py-4 px-6 text-right font-bold text-xl print:py-2 print:px-3 print:text-lg">{formatCurrency(calculatedNetTotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes, Policies, Terms and QR Code */}
        <div className="flex justify-between items-start mb-8 print:mb-4 print:items-end">
          <div className="flex-1 pr-4">
            {estimateData.notes && (
              <>
                <div className="font-bold text-lg mb-3 print:text-base print:mb-2">Notes</div>
                <ul className="text-gray-700 space-y-1 text-sm print:text-xs">
                  <li>• {estimateData.notes}</li>
                </ul>
              </>
            )}
            {studioData.policies && studioData.policies.trim() !== '' && (
              <div className="mt-6 print:mt-3">
                <div className="font-bold text-lg mb-3 print:text-base print:mb-2">Policies</div>
                <ul className="text-gray-700 space-y-1 text-sm print:text-xs">
                  {studioData.policies.split('\n').map((policy, index) => policy.trim() !== '' && (
                    <li key={index}>• {policy.trim()}</li>
                  ))}
                </ul>
              </div>
            )}
            
          </div>

          
        </div>

        {/* Bottom border and footer */}
        <div className="border-t-2 border-[#8B7355] pt-6 print:pt-3">
          <div className="text-center text-xl font-bold tracking-[0.2em] text-gray-800 print:text-lg">{studioData.studioName}</div>

          {/* Studio Contact Details in Footer */}
          <div className="text-center text-gray-600 mt-4 text-sm print:text-xs print:mt-2">
            {studioData.address && (
              <div className="mb-1">
                <FaMapMarkerAlt className="inline-block mr-1 text-[#8B7355]" />
                <span>
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
              <div className="mb-1">
                <FaPhone className="inline-block mr-1 text-[#8B7355]" />
                <span>{studioData.phone}</span>
                {studioData.phone2 && <span>, {studioData.phone2}</span>}
              </div>
            )}
            {studioData.email && (
              <div className="mb-1">
                <FaEnvelope className="inline-block mr-1 text-[#8B7355]" />
                <a href={`mailto:${studioData.email}`} className="text-gray-600 hover:underline">
                  {studioData.email}
                </a>
              </div>
            )}
            {studioData.website && (
              <div className="mb-1">
                <a href={`https://${studioData.website}`} target="_blank" rel="noopener noreferrer" className="text-[#8B7355] hover:underline">
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
        </div>

        <div className="border-t border-b-2 border-[#8B7355] mt-6 print:mt-3"></div>
      </div>
    </div>
  );
};

export default ThemeVintage;