import React from "react";
import { FaYoutube, FaInstagram, FaFacebook } from "react-icons/fa";
const ThemeMinimal = ({ estimate, studio }) => {
  const StudioData = studio;
  console.log(StudioData);

  const defaultEstimate = {
    _id: "ES-0269",
    clientName: "Emily Hana",
    functionName: "Wedding Photography Estimate",
    location: "456 Client Street, Client town, ST 67890",
    phoneNumber: "(987) 654-3210",
    startDate: new Date("2029-01-30"),
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
    discount: 0,
    tax: undefined,
    netTotal: 7000,
    notes: "A deposit of $500 is required to secure the booking.",
    terms: [
      "Cancellation policy: Deposit is non-refundable if cancelled less than 60 days before the event.",
    ],
  };

  // Merge provided data with defaults
  const estimateData = { ...defaultEstimate, ...estimate };
  const studioData = {
    name: "Perfect Moment",
    contactPhone: "(123) 456-7890",
    contactEmail: "info@perfectmoment.com",
    contactAddress: "123 Photography Lane, Amityville, ST 12345",
    ...studio,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    // The main container adapted from ThemeMinimal's structure
    <div className="max-w-4xl mx-auto font-sans text-gray-900 print-a4-document-wrapper">
      {/* We'll use a flex container for the left image panel and right content panel */}
      <div className="flex bg-white shadow-lg rounded-lg overflow-hidden md:shadow-none md:rounded-none">
        {/* Left Section (Image and Contact Info) - adapted from original image design */}
        <div
          className="relative w-1/3 bg-cover bg-center left-panel-print"
          style={{
            backgroundImage: `url('https://i.pinimg.com/1200x/62/d2/40/62d240a71b273856cbef0098f9aaa487.jpg')`,
          }}
        >
          {/* Overlay for text readability */}
          {/* <div className="absolute inset-0 bg-black bg-opacity-10"></div> */}

          <div className="relative z-10 flex flex-col h-full text-white p-8">
            <div className="flex flex-col items-center mb-12">
              {/* Logo/Studio Name */}
              <div className="mb-2">
                <img
                  src={studioData.logoUrl}
                  alt=""
                  className="w-32 h-32 rounded-2xl"
                />
              </div>
              {/* <h2 className="text-xl font-semibold uppercase tracking-wider">{studio.studioName}</h2> */}
            </div>
            {/* Customer Information (from image's left panel) */}
            {/* <div className="mt-auto bg-black/20 bg-opacity-5 p-6 rounded-md mb-4">
              <h3 className="text-lg font-bold mb-3 uppercase">Customer Information</h3>
              <p className="text-sm">{estimateData.clientName}</p>
              {estimateData.phoneNumber && <p className="text-sm">{estimateData.phoneNumber}</p>}
              
              
              <p className="text-sm">
                {estimateData.location.split(',').map((part, index) => (
                  <span key={index}>{part.trim()}<br/></span>
                ))}
              </p>
            </div>  */}
            {/* Contact Us (from image's left panel) */}
             <div className="mt-auto p-6 rounded-md">
              <h3 className="text-lg font-bold mb-3 uppercase">Contact Us</h3> 
              {studioData.phone && (
                <p className="text-sm">{studioData.phone}</p>
              )}
              {studioData?.phone2 && (
                <p className="text-sm">{studioData?.phone2}</p>
              )}
              {studioData.email && (
                <p className="text-sm">{studioData.email}</p>
              )}
              {studioData.address && (
                <p className="text-sm">
                  {studioData.address.d_address && <span>{studioData.address.d_address}<br/></span>}
                  {studioData.address.city && <span>{studioData.address.city}, </span>}
                  {studioData.address.state && <span>{studioData.address.state}</span>}
                  {studioData.address.pincode && <span> - {studioData.address.pincode}</span>}
                </p>
              )}
              
              {studioData.website && (
                <p className="text-sm">
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

              {/* Social Media Icons */}
              <div className="flex space-x-4 mt-4">
                
                
                {studioData.socialLinks.youtube && (
                  <a
                    href={studioData.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white  hover:text-red-500 transition-colors duration-200"
                  >
                    <FaYoutube size={24} />
                  </a>
                )}
                {studioData.socialLinks.instagram && (
                  <a
                    href={studioData.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-pink-500 transition-colors duration-200"
                  >
                    <FaInstagram size={24} />
                  </a>
                )}
                {studioData.socialLinks.facebook && (
                  <a
                    href={studioData.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-blue-600 transition-colors duration-200"
                  >
                    <FaFacebook size={24} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Section (Estimate Details) - adapted from ThemeMinimal's right panel */}
        <div className="w-2/3 p-12 right-panel-print">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-6">
            {estimateData.functionName}
          </h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for your interest in our wedding photography services.
            Here is a detailed estimate for capturing your special day.
          </p>

          <div className="mb-8">
            <p className="text-gray-700 text-sm font-semibold">
              Estimate No.{estimateData._id.split("-")[1]}
            </p>{" "}
            {/* Extracting "0269" */}
            <p className="text-gray-700 text-sm">
              {formatDate(estimateData.startDate)}
            </p>
          </div>

          {/* Services Table - adapted from ThemeMinimal's table style */}
          <div className="mb-12">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800 text-white text-left">
                    {" "}
                    {/* Changed header color to match original image */}
                    <th className="py-3 px-4 text-sm font-semibold uppercase">
                      Package
                    </th>{" "}
                    {/* Changed "Description" to "Package" */}
                    <th className="py-3 px-4 text-sm font-semibold uppercase">
                      Description
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-sm uppercase">
                      Total
                    </th>{" "}
                    {/* Adjusted to match original image layout */}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {estimateData.services.map((service, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <td className="py-3 px-4 font-semibold text-gray-700">
                        {service.serviceName}
                      </td>
                      <td className="py-3 px-4 text-gray-700">
                        {service.description}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-700">
                        {formatCurrency(service.total)}
                      </td>
                    </tr>
                  ))}

                  {/* Totals Row - adapted from original image, simplified from ThemeMinimal's complex totals */}
                  <tr className="border-t-2 border-gray-300">
                    <td
                      colSpan={2}
                      className="py-3 px-4 text-right font-bold text-gray-800 bg-gray-200 uppercase text-sm"
                    >
                      SUBTOTAL:
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-800 bg-gray-200">
                      {formatCurrency(estimateData.netTotal)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Notes - From original image */}
          {estimateData.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Additional Notes:
              </h3>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>
                  <span className="font-semibold">{estimateData.notes}</span>
                </li>
              </ul>
            </div>
          )}

          {/* Terms and Conditions - From original image */}
          {estimateData.terms && estimateData.terms.length > 0 && (
            <div className="mb-8">
              {/* No specific background/padding as in ThemeMinimal, matching the original image's style */}
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                {estimateData.terms.map((term, index) => (
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
  );
};

export default ThemeMinimal;
