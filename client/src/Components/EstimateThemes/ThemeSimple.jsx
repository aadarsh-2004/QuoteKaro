import { Phone } from "lucide-react"

const ThemeSimple = ({ estimate, studio }) => {
  // --- Data Initialization and Fallbacks ---
  const data = estimate || {}
  const studioData = studio || {}

  // Default values for common fields if they are missing
  const defaultEstimate = {
    _id: "789456123",
    clientName: "Thomas Jackson",
    studioName: "ABC Photography",
    studioEmail: "contact@abcstudio.com",
    studioPhone: "(123) 456-7890",
    phoneNumber: "+91 98765 43210",
    startDate: new Date("2030/01/30"),
    services: [
      {
        serviceName: "Pre-Shoot Consultation",
        description: "Discuss client's needs, location, and concept planning",
        total: 100,
      },
      {
        serviceName: "Photoshoot",
        description: "3-hour outdoor session with setup and shoot time",
        total: 500,
      },
      {
        serviceName: "Post-Processing",
        description: "Editing and retouching of 20 selected photos",
        total: 300,
      },
    ],
    additionalCosts: [
      {
        serviceName: "Travel Expenses",
        description: "Travel within 50 miles included",
        total: 0,
        included: true,
      },
      {
        serviceName: "Props/Equipment Rental",
        description: "Additional lighting equipment",
        total: 50,
      },
      {
        serviceName: "Miscellaneous",
        description: "Parking fees",
        total: 20,
      },
    ],
    subtotal: 970,
    discount: 100,
    netTotal: 870,
    terms: [
      "30% deposit required upon booking.",
      "Balance due upon final photo delivery.",
      "Full refund if canceled 72+ hours before the shoot; deposit forfeited if canceled within 72 hours.",
      "All raw files and copyrights remain with the studio",
      "Delivery timeline: 2-3 weeks after the shoot"
    ],
  }

  // Merge provided data with defaults
  const estimateData = { ...defaultEstimate, ...data }

  const formatDate = (dateInput) => {
    if (!dateInput) return "N/A"
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return "Invalid Date"
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    })
  }

  const formatCurrency = (amount, included = false) => {
    if (included) return "$0 (included)"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0)
  }

  return (
    <div className="max-w-2xl mx-auto bg-white font-sans">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-br from-purple-600 to-pink-500 text-white p-6 relative">
        {/* Top bar with logo */}
        <div className="flex items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-purple-600 text-sm font-bold">📷</span>
            </div>
            <div className="text-sm font-medium">{studioData.studioName}</div>
          </div>
        </div>

        {/* Main title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold leading-tight">General</h1>
          <h2 className="text-3xl font-bold leading-tight">Photoshoot</h2>
          <h3 className="text-3xl font-bold leading-tight">Estimate</h3>
          <div className="text-sm opacity-90 mt-2">{formatDate(estimateData.startDate)}</div>
        </div>

        {/* Studio Information */}
        <div className="absolute top-6 right-6 text-right text-sm">
          <div className="font-semibold mb-2">Studio Information:</div>
          <div className="space-y-1 opacity-90">
            <div>{studioData.studioName} Studio</div>
            <div>{studioData.studioEmail}</div>
            <div>{studioData.studioPhone}</div>
            <div className="mt-2">License Number: {estimateData.licenseNumber}</div>
          </div>
        </div>
      </div>

      {/* Main Content Card - Overlaying */}
      <div className="bg-white p-6">
        {/* Client Information */}
        <div className="mb-6">
          <h4 className="font-bold text-lg mb-4">Client Information:</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="text-lg font-semibold mb-2">{estimateData.clientName}</div>
            <div className="text-gray-600">{estimateData.location}</div>
            {estimateData.phoneNumber && (
              <div className="text-gray-600 mt-1">
                <Phone className="w-4 h-4 inline-block mr-1" />
                {estimateData.phoneNumber}
              </div>
            )}
          </div>
        </div>

        {/* Services Section */}
        <div className="mb-6">
          <h4 className="font-bold text-lg mb-4">Services Provided:</h4>
          <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold">Service</th>
                  <th className="text-left py-4 px-6 font-semibold">Description</th>
                  <th className="text-right py-4 px-6 font-semibold">Cost</th>
                </tr>
              </thead>
              <tbody>
                {estimateData.services.map((service, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-b-0 hover:bg-white transition-colors">
                    <td className="py-4 px-6 font-medium">{service.serviceName}</td>
                    <td className="py-4 px-6 text-gray-600">{service.description}</td>
                    <td className="py-4 px-6 text-right font-medium">{formatCurrency(service.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total Estimate */}
        <div className="mb-8">
          <div className="bg-gray-50 rounded-lg overflow-hidden">
            <div className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(estimateData.subtotal)}</span>
              </div>
              {estimateData.discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(estimateData.discount)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center py-3 bg-purple-600 text-white px-4 font-bold">
              <span>Total Estimate</span>
              <span className="text-lg">{formatCurrency(estimateData.netTotal)}</span>
            </div>
          </div>
        </div>

        {/* Bottom Section - Terms and Signature */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-200">
          {/* Terms and Conditions */}
          <div>
            <h4 className="font-bold text-lg mb-4">Terms and Conditions:</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              {estimateData.terms.map((term, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2 text-purple-600">•</span>
                  <span>{term}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Signature */}
          <div>
            <h4 className="font-bold text-lg mb-4">Customer Signature</h4>
            <div className="mt-8">
              <div className="border-b border-gray-300 pb-2 mb-2">
                <div className="font-script text-2xl text-gray-800 italic">{estimateData.clientName}</div>
              </div>
              <div className="text-sm text-gray-600">{formatDate(estimateData.startDate)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeSimple