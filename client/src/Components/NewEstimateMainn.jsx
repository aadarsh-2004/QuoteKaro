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
import React, { useEffect, useState, useMemo } from "react";
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

  // Populate notes from userData when available
  useEffect(() => {
    if (userData && userData.notes) {
      setFormData((prev) => ({
        ...prev,
        notes: userData.notes,
      }));
    }
  }, [userData]);

  const [services, setServices] = useState([
    { id: 1, serviceName: "", quantity: 1, pricePerUnit: 0, total: 0, isCustomInput: false },
  ]);

  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    discountType: "percentage", // 'percentage' or 'amount'
    netTotal: 0,
  });

  // Use user's custom services for options
  const userServicesOptions = useMemo(() => {
    const services = userData?.services?.map((s) => ({
      name: s.name,
      price: s.price,
    })) || [];
    return services.sort((a, b) => a.name.localeCompare(b.name));
  }, [userData]);

  const calculateTotals = () => {
    const subtotal = services.reduce((sum, service) => sum + (Number(service.total) || 0), 0);
    let discountAmount = 0;

    if (totals.discountType === "percentage") {
      discountAmount = (subtotal * Number(totals.discount)) / 100;
    } else {
      discountAmount = Number(totals.discount) || 0;
    }

    const netTotal = Math.max(0, subtotal - discountAmount);

    setTotals((prev) => ({
      ...prev,
      subtotal,
      netTotal: netTotal,
    }));
  };

  // Recalculate totals whenever services, discount, or discountType change
  useEffect(() => {
    calculateTotals();
  }, [services, totals.discount, totals.discountType]);

  // Render null or loading indicator while user data is not available
  if (loading || !userData) return <div className="flex justify-center items-center h-screen text-gray-700">Loading user data...</div>;


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
          const updated = { ...service };

          if (field === "serviceName") {
            if (value === "custom_input") {
              // User explicitly selected 'Write new service' from the dropdown
              updated.serviceName = ""; // Clear current name for new input
              updated.isCustomInput = true; // Activate custom input mode
              updated.pricePerUnit = 0; // Reset price for the new custom service
            } else {
              // User either selected a predefined service OR typed into a custom input field.
              const selectedOption = userServicesOptions.find(
                (option) => option.name === value
              );

              updated.serviceName = value; // Update the service name (either selected or typed)

              if (selectedOption) {
                // User selected a predefined option, so it's no longer custom input mode
                updated.pricePerUnit = selectedOption.price;
                updated.isCustomInput = false;
              } else {
                // If no predefined option was selected and it was already a custom input,
                // means the user is typing. Keep isCustomInput true.
                // If value is empty and it's not a custom input, reset price.
                if (value === "" && !updated.isCustomInput) {
                    updated.pricePerUnit = 0; // Reset price if select is cleared
                }
                // If it's a custom input (`updated.isCustomInput` is already true here),
                // we don't need to change `isCustomInput` or `pricePerUnit` unless explicitly clearing.
                // This preserves the typing experience.
              }
            }
          } else {
            // For quantity or pricePerUnit changes
            updated[field] = value;
          }

          // Recalculate total for quantity, pricePerUnit, or when serviceName causes price change
          updated.total = updated.quantity * updated.pricePerUnit;
          return updated;
        }
        return service;
      })
    );
  };

  const addService = () => {
    const newId = services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;
    setServices((prev) => [
      ...prev,
      {
        id: newId,
        serviceName: "",
        quantity: 1,
        pricePerUnit: 0,
        total: 0,
        isCustomInput: false, // Initialize as not a custom input
      },
    ]);
  };

  const removeService = (idToRemove) => {
    if (services.length > 1) {
      setServices((prev) => prev.filter((service) => service.id !== idToRemove));
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
      const isExpired = userData && userData.planExpiresAt && new Date(userData.planExpiresAt) < new Date();
      if (isExpired) {
        toast.error("🚫 Your plan has expired. Please upgrade to continue.");
        setTimeout(() => {
          navigate("/plancreditmanagement"); // Corrected route
        }, 2000);
        return;
      }

      // Using userData.firebaseUID directly from context
      const firebaseUID = userData?.firebaseUID || localStorage.getItem("firebaseUID");
      if (!firebaseUID) {
        toast.error("Authentication error. Please log in again.");
        return;
      }

      // Check for left_credits (assuming 2 credits for new estimate creation)
      if (userData && userData.left_credits < 2) {
        toast.error("You're out of credits. Please upgrade your plan to create new estimates.");
        setTimeout(() => {
          navigate("/plancreditmanagement"); // Corrected route
        }, 2000);
        return;
      }
      
      if (userData && userData.isSuspended) {
        toast.error("Your account is suspended. Please contact support.");
        setTimeout(() => {
          navigate("/plancreditmanagement"); // Corrected route
        }, 2000);
        return;
      }


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

      const validServices = services.filter(s =>
        s.serviceName.trim() !== "" && s.quantity > 0 && s.pricePerUnit >= 0
      );

      if (validServices.length === 0) {
        toast.error("Please add at least one valid service with a name, quantity (min 1), and valid price (min ₹0).");
        return;
      }

      const payload = {
        firebaseUID,
        ...formData,
        services: validServices.map(s => ({ // Ensure no `id` or `isCustomInput` is sent to backend
          serviceName: s.serviceName,
          quantity: s.quantity,
          pricePerUnit: s.pricePerUnit,
          total: s.total,
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        discountType: totals.discountType,
        netTotal: totals.netTotal,
        status: "draft", // New estimates start as draft
        date: new Date().toISOString(),
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/estimates/create`,
        payload
      );

      if (res.data.success) {
        toast.success("Draft Saved ✅ ");
        console.log("✅ Estimate created successfully", res.data);
        await refresh(); // Refresh user data after credit deduction
        await refreshEstimates(); // Refresh estimates list

        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (err) {
      console.error("❌ Failed to create estimate", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to save estimate. Please try again.");
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
                maxLength="13"
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
            {userServicesOptions.length === 0 && services.length === 1 && services[0].serviceName === "" && !services[0].isCustomInput ? (
              <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-lg font-medium text-gray-700 mb-4">
                  Looks like you haven't added any custom services yet!
                </p>
                <p className="text-gray-600 mb-6">
                  Define your services and their default prices, or write a new one directly below.
                </p>
                <button
                  onClick={() => navigate("/settings/preferences")} // Assuming this is the correct route
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md"
                >
                  Go to Preferences to Create Services
                </button>
              </div>
            ) : (
              services.map((service) => (
                <div
                  key={service.id}
                  className="bg-gradient-to-r from-gray-50 to-purple-50/30 p-4 rounded-2xl border border-gray-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Service Name
                      </label>
                      {service.isCustomInput ? (
                        <input
                          type="text"
                          value={service.serviceName}
                          onChange={(e) =>
                            handleServiceChange(
                              service.id,
                              "serviceName",
                              e.target.value
                            )
                          }
                          placeholder="Enter new service name"
                          className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                          autoFocus
                        />
                      ) : (
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
                          <option value="custom_input" className="font-bold text-purple-700 bg-purple-50">
                            --- Write new service ---
                          </option>
                          {userServicesOptions.map((option) => (
                            <option key={option.name} value={option.name}>
                              {option.name} {option.price > 0 ? `(₹${option.price.toLocaleString()})` : ''}
                            </option>
                          ))}
                        </select>
                      )}
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
                        Price per Unit (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
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
              ))
            )}
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
              <span className="text-2xl bg-gradient-to-r font-bold from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ₹{totals.netTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Notes Section */}
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
        <div className="flex flex-col sm:flex-row gap-4 text-white">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 hover:scale-105 py-4 px-6 rounded-2xl font-bold hover:bg-gradient-to-r from-purple-600  hover: from-pink-600 to-pink-600  transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
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
