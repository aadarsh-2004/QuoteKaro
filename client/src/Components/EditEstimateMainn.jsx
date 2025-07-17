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
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import React, { useEffect, useState, useMemo, useCallback } from "react"; // Added useCallback
import axios from "axios";

import WelcomeSection from "./WelcomeSection";
import { useUser } from "../context/UserContext";
import { useEstimates } from "../context/EstimateContext";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const EditEstimateMainn = () => {
  const { id } = useParams();
  const { estimates, refreshEstimates } = useEstimates();
  const { userData, loading, refresh } = useUser();
  const navigate = useNavigate();
  const [edited  , setedited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: "",
    clientName: "",
    functionName: "",
    phoneNumber: "",
    location: "",
    description: "", // Main estimate description
    startDate: "",
    endDate: "",
    notes: "",
  });

  const [services, setServices] = useState([
    {
      id: 1,
      serviceName: "",
      quantity: 1,
      pricePerUnit: 0,
      total: 0,
      isCustomInput: false,
      description: "",
    }, // Added serviceDescription
  ]);

  const [totals, setTotals] = useState({
    subtotal: 0,
    discount: 0,
    discountType: "percentage", // 'percentage' or 'amount'
    netTotal: 0,
  });

  const userServicesOptions = useMemo(() => {
    const services =
      userData?.services?.map((s) => ({
        name: s.name,
        price: s.price,
      })) || [];
    return services.sort((a, b) => a.name.localeCompare(b.name));
  }, [userData]);

  const statusOptions = [
    {
      value: "draft",
      label: "Draft",
      icon: AlertCircle,
      color: "text-gray-600",
    },
    { value: "sent", label: "Sent", icon: Clock, color: "text-blue-600" },
    {
      value: "approved",
      label: "Approved",
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      value: "rejected",
      label: "Rejected",
      icon: XCircle,
      color: "text-red-600",
    },
  ];

  const estimateToEdit = useMemo(() => {
    return estimates.find((e) => e._id === id);
  }, [estimates, id]);

  useEffect(() => {
    if (estimateToEdit && userData) {
      setFormData({
        status: estimateToEdit.status || "draft",
        clientName: estimateToEdit.clientName || "",
        functionName: estimateToEdit.functionName || "",
        phoneNumber: estimateToEdit.phoneNumber || "",
        location: estimateToEdit.location || "",
        description: estimateToEdit.description || "", // Main estimate description
        startDate: estimateToEdit.startDate
          ? new Date(estimateToEdit.startDate).toISOString().slice(0, 10)
          : "",
        endDate: estimateToEdit.endDate
          ? new Date(estimateToEdit.endDate).toISOString().slice(0, 10)
          : "",
        notes: estimateToEdit.notes || userData.notes || "",
      });

      const estimateServices = estimateToEdit.services || [];
      if (estimateServices.length > 0) {
        setServices(
          estimateServices.map((service, index) => ({
            ...service,
            id: service.id || index + 1,
            description: service.description || "", // Populate description
            isCustomInput: !userServicesOptions.some(
              (opt) => opt.name === service.serviceName
            ),
          }))
        );
      } else {
        setServices([
          {
            id: 1,
            serviceName: "",
            quantity: 1,
            pricePerUnit: 0,
            total: 0,
            isCustomInput: false,
            description: "",
          },
        ]);
      }

      setTotals({
        subtotal: estimateToEdit.subtotal || 0,
        discount: estimateToEdit.discount || 0,
        discountType: estimateToEdit.discountType || "percentage",
        netTotal: estimateToEdit.netTotal || 0,
      });
    }
  }, [estimateToEdit, userData, userServicesOptions]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleServiceChange = useCallback(
    (id, field, value) => {
      setServices((prev) =>
        prev.map((service) => {
          if (service.id === id) {
            const updated = { ...service };

            if (field === "serviceName") {
              if (value === "custom_input") {
                updated.serviceName = "";
                updated.isCustomInput = true;
                updated.pricePerUnit = 0;
              } else {
                const selectedOption = userServicesOptions.find(
                  (option) => option.name === value
                );

                updated.serviceName = value;

                if (selectedOption) {
                  updated.pricePerUnit = selectedOption.price;
                  updated.isCustomInput = false;
                } else {
                  if (value === "" && !updated.isCustomInput) {
                    updated.pricePerUnit = 0;
                  } else if (updated.isCustomInput) {
                    updated.pricePerUnit = updated.pricePerUnit;
                  }
                }
              }
            } else {
              updated[field] = value;
            }

            updated.total = updated.quantity * updated.pricePerUnit;
            return updated;
          }
          return service;
        })
      );
    },
    [userServicesOptions]
  ); // Add userServicesOptions to useCallback dependency

  const addService = useCallback(() => {
    const newId =
      services.length > 0 ? Math.max(...services.map((s) => s.id)) + 1 : 1;
    setServices((prev) => [
      ...prev,
      {
        id: newId,
        serviceName: "",
        quantity: 1,
        pricePerUnit: 0,
        total: 0,
        isCustomInput: false,
        description: "", // Added serviceDescription
      },
    ]);
  }, [services]);

  const removeService = useCallback(
    (id) => {
      if (services.length > 1) {
        setServices((prev) => prev.filter((service) => service.id !== id));
      }
    },
    [services.length]
  );

  const calculateTotals = useCallback(() => {
    const subtotal = services.reduce(
      (sum, service) => sum + (Number(service.total) || 0),
      0
    );
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
  }, [services, totals.discount, totals.discountType]);

  const handleDiscountChange = useCallback((field, value) => {
    setTotals((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]); // Dependency on memoized calculateTotals

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(
      (option) => option.value === status
    );
    if (!statusOption) return null;

    const Icon = statusOption.icon;
    return (
      <div className={`flex items-center gap-2 ${statusOption.color}`}>
        <Icon size={16} />
        <span className="font-medium">{statusOption.label}</span>
      </div>
    );
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    setIsLoading(true);
    

    try {
      const isExpired =
        userData &&
        userData.planExpiresAt &&
        new Date(userData.planExpiresAt) < new Date();
      if (isExpired) {
        toast.error("🚫 Your plan has expired. Please upgrade to continue.");
        setTimeout(() => {
          navigate("/plancreditmanagement");
        }, 2000);
        setIsLoading(false);
        return;
      }

      if (userData && userData.left_credits < 0.5) {
        toast.error("You're out of credits. Please upgrade to continue.");
        setTimeout(() => {
          navigate("/plancreditmanagement");
        }, 2000);
        setIsLoading(false);
        return;
      }

      if (userData && userData.isSuspended) {
        toast.error("Your account is suspended. Please contact support.");
        setTimeout(() => {
          navigate("/plancreditmanagement");
        }, 2000);
        setIsLoading(false);
        return;
      }

      const currentFirebaseUID =
        userData?.firebaseUID || localStorage.getItem("firebaseUID"); // Renamed to avoid confusion with parameter 'firebaseUID'
      if (!currentFirebaseUID) {
        toast.error("Authentication error. Please log in again.");
        setIsLoading(false);
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
        setIsLoading(false);
        return;
      }

      const validServices = services.filter(
        (service) =>
          service.serviceName &&
          service.serviceName.trim() !== "" &&
          (service.quantity > 0 || service.pricePerUnit > 0)
      );

      if (validServices.length === 0) {
        toast.error("Please add at least one valid service.");
        setIsLoading(false);
        return;
      }

      const payload = {
        firebaseUID: currentFirebaseUID, // Use the current firebaseUID
        ...formData,
        services: validServices.map((s) => ({
          serviceName: s.serviceName,
          quantity: s.quantity,
          pricePerUnit: s.pricePerUnit,
          total: s.total,
          description: s.description, // Include serviceDescription
        })),
        subtotal: totals.subtotal,
        discount: totals.discount,
        discountType: totals.discountType,
        netTotal: totals.netTotal,
        date: new Date().toISOString(),
      };

      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/estimate/edit/${id}`,
        payload
      );

      if (res.data.success) {
        toast.success("Estimate updated successfully ✅");
        console.log("✅ Estimate updated successfully", res.data);
        await refresh();
        setedited(true); 

        if (refreshEstimates) {
          await refreshEstimates();
        }

        // setTimeout(() => {
        //   navigate("/dashboard");
        // }, 2000);
      } else {
        toast.error(
          "Failed to update estimate: " + (res.data.message || "Unknown error")
        );
      }
    } catch (err) {
      console.error(
        "❌ Failed to update estimate",
        err.response?.data || err.message
      );
      toast.error(
        "Failed to update estimate: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !estimates || !userData)
    return (
      <div className="flex justify-center items-center h-screen text-gray-700">
        Loading...
      </div>
    );
  if (!estimateToEdit)
    return (
      <div className="flex justify-center items-center h-screen text-red-700">
        Estimate not found or unauthorized access.
      </div>
    );

  return (
    <div className="flex-1 p-0 m-0 md:p-8 overflow-y-auto">
      <div className="flex-col justify-between items-center mb-6">
        <WelcomeSection name="Edit-Estimate" />
      </div>

      <div className="max-w-7xl mx-auto p-3 md:p-6 space-y-6">
        <div className="bg-white rounded-2xl p-4 shadow-lg border w-fit border-purple-100">
          <div className="flex items-center gap-3 ">
            <span className="text-sm font-semibold text-gray-700">Status:</span>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="p-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-medium"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="ml-2">{getStatusBadge(formData.status)}</div>
          </div>
        </div>
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

            {/* Main Estimate Description Field */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Estimate Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Provide a detailed description of the overall event or function..."
                rows={3}
                className="w-full p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              ></textarea>
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
                {/* Changed from grid to flex for responsiveness */}
                <div className="flex flex-col">
                  {/* Service Name and Description in one row on desktop */}
                  <div>
                    <div className="flex flex-col md:flex-row gap-2">
                      {/* Service Name */}
                      <div className="w-full md:w-1/2">
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
                            placeholder="Type custom service name"
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                            <option
                              value="custom_input"
                              className="font-bold text-purple-700 bg-purple-50"
                            >
                              --- Write new service ---
                            </option>
                            {userServicesOptions.map((option) => (
                              <option key={option.name} value={option.name}>
                                {option.name}{" "}
                                {option.price > 0
                                  ? `(₹${option.price.toLocaleString()})`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      {/* Service Description */}
                      <div className="w-full md:w-1/2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Service Description (Optional)
                        </label>
                        <textarea
                          value={service.description} // Correctly bound to 'description'
                          onChange={(e) =>
                            handleServiceChange(
                              service.id,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Details for this specific service..."
                          rows={2}
                          className="w-full p-1 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Quantity, Price per Unit, Total + Remove Button in one row with gap */}
                  <div className="flex flex-col md:flex-row gap-2 mt-4">
                    {/* Quantity */}
                    <div className="w-full md:w-1/3">
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

                    {/* Price per Unit */}
                    <div className="w-full md:w-1/3">
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

                    {/* Total + Remove Button */}
                    <div className="flex items-end w-full md:w-1/3 gap-2">
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
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 hover:scale-105 text-white py-4 px-6 rounded-2xl font-bold hover:bg-gradient-to-r from-purple-600  hover: from-pink-600 to-pink-600  transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={20} />
            {isLoading ? "Updating..." : "Update Estimate"}
           
          </button>
          <button
            onClick={() =>
              
              navigate(`/preview/${estimateToEdit._id}`)
            }
            disabled={!edited} // Disable until an estimate is created
            className={`flex-1 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:scale-105 text-white py-4 px-6 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3
                        ${
                          !edited
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:from-emerald-600 hover:to-emerald-700"
                        }`}
          >
            <Send size={20} />
            View & Share Estimate
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEstimateMainn;
