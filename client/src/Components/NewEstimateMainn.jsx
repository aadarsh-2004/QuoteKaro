import {
  Plus,
  Trash2,
  Calendar,
  MapPin,
  FileText,
  Calculator,
  Percent,
  Save,
  Send,
} from "lucide-react";
import { useEffect, useState, React } from "react";
import WelcomeSection from "./WelcomeSection";
import axios from "axios";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useEstimates } from "../context/EstimateContext";
const NewEstimateMainn = () => {
  const { refreshEstimates } = useEstimates();
  const { userData, loading, refresh } = useUser();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    clientName: "",
    functionName: "",
    phoneNumber: "",
    location: "",
    description: "",
    startDate: "",
    endDate: "",
    notes: "",
  });
  // Then after userData is available, populate notes:
useEffect(() => {
  if (userData && userData.notes) {
    setFormData((prev) => ({
      ...prev,
      notes: userData.notes,
    }));
  }
}, [userData]);
  const [services, setServices] = useState([
    { id: 1, serviceName: "", quantity: 1, pricePerUnit: 0, total: 0 },
  ]);
 
  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    discountType: "percentage", // 'percentage' or 'amount'
    netTotal: 0,
  });

  const calculateTotals = () => {
    const subtotal = services.reduce((sum, service) => sum + service.total, 0);
    let discountAmount = 0;

    if (totals.discountType === "percentage") {
      discountAmount = (subtotal * totals.discount) / 100;
    } else {
      discountAmount = totals.discount;
    }

    const netTotal = Math.max(0, subtotal - discountAmount);

    setTotals((prev) => ({
      ...prev,
      subtotal,
      netTotal: netTotal,
    }));
  };

  useEffect(() => {
    calculateTotals();
  }, [services, totals.discount, totals.discountType]);

  if (loading || !userData) return null;

  const serviceOptions = [
    "Wedding Photography",
    "Pre-Wedding Shoot",
    "Engagement Photography",
    "Birthday Party Photography",
    "Corporate Event Photography",
    "Product Photography",
    "Portrait Photography",
    "Event Videography",
    "Drone Photography",
    "Photo Editing",
    "Album Design",
    "Video Editing",
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleServiceChange = (id, field, value) => {
    setServices((prev) =>
      prev.map((service) => {
        if (service.id === id) {
          const updated = { ...service, [field]: value };
          if (field === "quantity" || field === "pricePerUnit") {
            updated.total = updated.quantity * updated.pricePerUnit;
          }
          return updated;
        }
        return service;
      })
    );
  };

  const addService = () => {
    const newId = Math.max(...services.map((s) => s.id)) + 1;
    setServices((prev) => [
      ...prev,
      {
        id: newId,
        serviceName: "",
        quantity: 1,
        pricePerUnit: 0,
        total: 0,
      },
    ]);
  };

  const removeService = (id) => {
    if (services.length > 1) {
      setServices((prev) => prev.filter((service) => service.id !== id));
      calculateTotals();
    }
  };

  

  const handleDiscountChange = (field, value) => {
    setTotals((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  
  
  
  const handleSubmit = async () => {
    try {

      const isExpired = new Date(userData.planExpiresAt) < new Date();
      if (isExpired) {
         toast.error("🚫 Your plan has expired. Please upgrade to continue.");
        
        setTimeout(() => {
          navigate("/plan-credits");
        }, 2000);
      }
      const firebaseUID = localStorage.getItem("firebaseUID");

      // 🚨 Required field validation
      const requiredFields = [
        formData.clientName,
        formData.functionName,
        formData.phoneNumber,
        formData.startDate,
      ];

      if (requiredFields.some((field) => !field || field.trim() === "")) {
        toast.error("Please fill all required fields marked with *");
        return;
      }
      const payload = {
        firebaseUID,
        ...formData,
        services: services,
        subtotal: totals.subtotal,
        discount: totals.discount,
        discountType: totals.discountType,
        netTotal: totals.netTotal,
        status: "draft",
        date: new Date().toISOString(),
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/estimates/create`,
        payload
      );

      if (res.data.success) {
        toast.success("Draft Saved ✅ ");
        console.log("✅ Estimate created successfully");
        await refresh();
        await refreshEstimates();
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error("❌ Failed to create estimate", err);
    }
  };
  
  return (
    <div className="flex-1 p-0 m-0 md:p-8 overflow-y-auto">
      <WelcomeSection name="New-Estimate" />

      <div className="max-w-7xl mx-auto p-3 md:p-6 space-y-6">
        {/* Client Information Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Client Information
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Client Name *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) =>
                  handleInputChange("clientName", e.target.value)
                }
                placeholder="Enter client name"
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Function Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Function Name *
              </label>
              <input
                type="text"
                value={formData.functionName}
                onChange={(e) =>
                  handleInputChange("functionName", e.target.value)
                }
                placeholder="e.g., Wedding, Birthday Party"
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    handleInputChange("startDate", e.target.value)
                  }
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <div className="relative">
                <Calendar
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-4 top-4 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="Event location"
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                placeholder="e.g. +91 784xxxxxxx"
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Calculator size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Services</h2>
            </div>
            <button
              onClick={addService}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Plus size={18} />
              Add Service
            </button>
          </div>

          <div className="space-y-4">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="bg-gradient-to-r from-gray-50 to-purple-50/30 p-4 rounded-2xl border border-gray-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Service Name
                    </label>
                    <select
                      value={service.serviceName}
                      onChange={(e) =>
                        handleServiceChange(
                          service.id,
                          "serviceName",
                          e.target.value
                        )
                      }
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select a service</option>
                      {serviceOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={service.quantity}
                      onChange={(e) =>
                        handleServiceChange(
                          service.id,
                          "quantity",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price per Unit
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={service.pricePerUnit}
                      onChange={(e) =>
                        handleServiceChange(
                          service.id,
                          "pricePerUnit",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Total
                      </label>
                      <div className="w-full p-3 bg-purple-50 border border-purple-200 rounded-xl font-bold text-purple-600">
                        ₹{service.total.toLocaleString()}
                      </div>
                    </div>
                    {services.length > 1 && (
                      <button
                        onClick={() => removeService(service.id)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Percent size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Total Calculation
            </h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-700 font-medium">Subtotal</span>
              <span className="text-xl font-bold text-gray-900">
                ₹{totals.subtotal.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Type
                </label>
                <select
                  value={totals.discountType}
                  onChange={(e) =>
                    handleDiscountChange("discountType", e.target.value)
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="amount">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount{" "}
                  {totals.discountType === "percentage" ? "(%)" : "(₹)"}
                </label>
                <input
                  type="number"
                  min="0"
                  max={
                    totals.discountType === "percentage" ? 100 : totals.subtotal
                  }
                  value={totals.discount}
                  onChange={(e) =>
                    handleDiscountChange(
                      "discount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Amount
                </label>
                <div className="w-full p-3 bg-red-50 border border-red-200 rounded-xl font-bold text-red-600">
                  -₹
                  {(totals.discountType === "percentage"
                    ? (totals.subtotal * totals.discount) / 100
                    : totals.discount
                  ).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center py-4 border-t-2 border-purple-200 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl px-4">
              <span className="text-xl font-bold text-purple-900">
                Net Total
              </span>
              <span className="text-2xl  bg-gradient-to-r font-bold from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ₹{totals.netTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Additional Notes
            </h2>
          </div>

          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange("notes", e.target.value)}
            placeholder="Add any special terms, conditions, or additional information..."
            rows={4}
            className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 hover:scale-105  text-white py-4 px-6 rounded-2xl font-bold hover:bg-gradient-to-r from-purple-600  hover: from-pink-600 to-pink-600  transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <Save size={20} />
            Save as Draft
          </button>
          <button className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:scale-105 text-white py-4 px-6 rounded-2xl font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3">
            <Send size={20} />
            Send Estimate
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewEstimateMainn;
