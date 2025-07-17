import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { v4 as uuidv4 } from "uuid"; // For generating unique IDs for new services
import axios from "axios"; // For making API requests
import { toast } from 'react-hot-toast'; // For better notifications

const ServicesManagement = ({ userId }) => {
    // userId is now a prop, assuming it's passed from a parent component
    const [userServices, setUserServices] = useState([]);
    const [editingService, setEditingService] = useState(null); // { id: serviceId, name: '', price: 0, isNew: boolean }
    const [serviceName, setServiceName] = useState("");
    const [servicePrice, setServicePrice] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Base URL for your API
    const API_BASE_URL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"; // Replace with your actual backend URL

    useEffect(() => {
        if (userId) {
            fetchServices();
        }
    }, [userId]); // Refetch when userId changes

    const fetchServices = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/${userId}/services`
            );
            if (response.data.success) {
                // Map _id to id for consistency with the frontend component's expectation of 'id'
                const fetchedServices = response.data.services.map((service) => ({
                    ...service,
                    id: service._id, // Use _id from MongoDB as the frontend 'id'
                }));
                setUserServices(fetchedServices);
            } else {
                setError(response.data.message || "Failed to fetch services.");
                toast.error(response.data.message || "Failed to fetch services.");
            }
        } catch (err) {
            console.error("Error fetching services:", err);
            setError(
                err.response?.data?.message ||
                "Error fetching services. Please try again."
            );
            toast.error(err.response?.data?.message || "Error fetching services.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddService = () => {
        if (editingService) {
            toast.error("Please save or cancel the current service edit first.");
            return;
        }
        // For a new service, we generate a temporary UUID. The actual _id will be assigned by MongoDB.
        // We set isNew: true to trigger the new service form rendering at the top.
        setEditingService({ id: uuidv4(), name: "", price: 0, isNew: true });
        setServiceName("");
        setServicePrice(0);
    };

    const handleEditClick = (service) => {
        if (editingService) {
            toast.error("Please save or cancel the current service edit first.");
            return;
        }
        setEditingService({ ...service, isNew: false }); // Mark as existing service
        setServiceName(service.name);
        setServicePrice(service.price);
    };

    const handleSaveService = async () => {
        if (!serviceName.trim()) {
            toast.error("Service name cannot be empty.");
            return;
        }
        if (parseFloat(servicePrice) < 0) {
            toast.error("Price must be non-negative.");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            if (editingService.isNew) {
                // Adding new service
                const response = await axios.post(
                    `${API_BASE_URL}/api/${userId}/services`,
                    {
                        name: serviceName.trim(),
                        price: parseFloat(servicePrice),
                    }
                );
                if (response.data.success) {
                    // Prepend new service to the local state, using the _id from the backend
                    // THIS IS THE KEY CHANGE FOR NEW SERVICE POSITION
                    setUserServices((prevServices) => [
                        { ...response.data.service, id: response.data.service._id },
                        ...prevServices,
                    ]);
                    setEditingService(null);
                    setServiceName("");
                    setServicePrice(0);
                    toast.success("Service added successfully!");
                } else {
                    setError(response.data.message || "Failed to add service.");
                    toast.error(response.data.message || "Failed to add service.");
                }
            } else {
                // Editing existing service
                const response = await axios.put(
                    `${API_BASE_URL}/api/${userId}/services/${editingService.id}`,
                    {
                        name: serviceName.trim(),
                        price: parseFloat(servicePrice),
                    }
                );
                if (response.data.success) {
                    // Update local state with the updated service
                    setUserServices((prevServices) =>
                        prevServices.map((s) =>
                            s.id === editingService.id
                                ? { ...response.data.service, id: response.data.service._id }
                                : s
                        )
                    );
                    setEditingService(null);
                    setServiceName("");
                    setServicePrice(0);
                    toast.success("Service updated successfully!");
                } else {
                    setError(response.data.message || "Failed to update service.");
                    toast.error(response.data.message || "Failed to update service.");
                }
            }
        } catch (err) {
            console.error("Error saving service:", err);
            setError(
                err.response?.data?.message || "Error saving service. Please try again."
            );
            toast.error(err.response?.data?.message || "Error saving service.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingService(null);
        setServiceName("");
        setServicePrice(0);
    };

    const handleDeleteService = async (id) => {
        setIsSaving(true);
        setError(null);
        try {
            const response = await axios.delete(
                `${API_BASE_URL}/api/${userId}/services/${id}`
            );
            if (response.data.success) {
                setUserServices((prevServices) =>
                    prevServices.filter((s) => s.id !== id)
                );
                toast.success("Service deleted successfully!");
            } else {
                setError(response.data.message || "Failed to delete service.");
                toast.error(response.data.message || "Failed to delete service.");
            }
        } catch (err) {
            console.error("Error deleting service:", err);
            setError(
                err.response?.data?.message ||
                "Error deleting service. Please try again."
            );
            toast.error(err.response?.data?.message || "Error deleting service.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
                Loading services...
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                role="alert"
            >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
                <span
                    className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    onClick={() => setError(null)}
                >
                    <svg
                        className="fill-current h-6 w-6 text-red-500"
                        role="button"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                    >
                        <title>Close</title>
                        <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                    </svg>
                </span>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Manage Your Services
                </h2>
                <button
                    onClick={handleAddService}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center shadow-md hover:shadow-lg"
                    disabled={isSaving || editingService} // Disable if saving or already editing
                >
                    <Plus size={16} className="mr-2" /> Add Service
                </button>
            </div>

            <div className="space-y-4">
                {/* Conditionally render the "Add New Service" form at the top */}
                {editingService && editingService.isNew && (
                    <div className="bg-white p-6 rounded-lg border border-purple-200 shadow-lg">
                        <h3 className="text-lg font-bold text-purple-700 mb-4">Add New Service</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label htmlFor="new-service-name" className="sr-only">Service Name</label>
                                <input
                                    id="new-service-name"
                                    type="text"
                                    value={serviceName}
                                    onChange={(e) => setServiceName(e.target.value)}
                                    placeholder="e.g., Candid Videography"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-700 placeholder-gray-400"
                                    autoFocus // Auto-focus when adding a new service
                                />
                            </div>
                            <div>
                                <label htmlFor="new-service-price" className="sr-only">Price</label>
                                <input
                                    id="new-service-price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={servicePrice}
                                    onChange={(e) => setServicePrice(e.target.value)}
                                    placeholder="Price (e.g., 25000)"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-700 placeholder-gray-400"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                onClick={handleSaveService}
                                className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md flex items-center justify-center gap-2"
                                title="Save Service"
                                disabled={isSaving}
                            >
                                <CheckCircle size={20} /> {isSaving ? "Adding..." : "Add Service"}
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                className="flex-1 sm:flex-none px-6 py-3 bg-gray-300 text-gray-800 rounded-xl font-semibold hover:bg-gray-400 transition-all shadow-md flex items-center justify-center gap-2"
                                title="Cancel Add"
                                disabled={isSaving}
                            >
                                <XCircle size={20} /> Cancel
                            </button>
                        </div>
                    </div>
                )}

                {userServices.length === 0 && !editingService ? ( // Only show "No services" message if no services AND not in add mode
                    <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-lg font-medium text-gray-700 mb-4">
                            No custom services added yet.
                        </p>
                        <p className="text-gray-600 mb-6">
                            Click "Add Service" to define your first service and its default price.
                        </p>
                    </div>
                ) : (
                    // Render existing services
                    userServices.map((service) => (
                        <div
                            key={service.id}
                            className="flex flex-col sm:flex-row items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200"
                        >
                            {editingService && editingService.id === service.id ? (
                                // Editing form for current service
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"> {/* Increased gap for better spacing */}
                                    <div>
                                        <label htmlFor={`service-name-${service.id}`} className="sr-only">Service Name</label>
                                        <input
                                            id={`service-name-${service.id}`}
                                            type="text"
                                            value={serviceName}
                                            onChange={(e) => setServiceName(e.target.value)}
                                            placeholder="Service Name"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-700 placeholder-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`service-price-${service.id}`} className="sr-only">Price</label>
                                        <input
                                            id={`service-price-${service.id}`}
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={servicePrice}
                                            onChange={(e) => setServicePrice(e.target.value)}
                                            placeholder="Price"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-gray-700 placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex flex-col sm:flex-row justify-end gap-3 mt-2">
                                        <button
                                            onClick={handleSaveService}
                                            className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-md flex items-center justify-center gap-2"
                                            title="Save Service"
                                            disabled={isSaving}
                                        >
                                            <CheckCircle size={20} /> {isSaving ? "Saving..." : "Save"}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="flex-1 sm:flex-none px-6 py-3 bg-gray-300 text-gray-800 rounded-xl font-semibold hover:bg-gray-400 transition-all shadow-md flex items-center justify-center gap-2"
                                            title="Cancel Edit"
                                            disabled={isSaving}
                                        >
                                            <XCircle size={20} /> Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Display mode
                                <>
                                    <div className="flex-1 mb-2 sm:mb-0">
                                        <h4 className="font-semibold text-lg text-gray-800">
                                            {service.name}
                                        </h4>
                                        <p className="text-md text-gray-600">
                                            ₹{service.price.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditClick(service)}
                                            className="p-3 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors shadow-sm"
                                            title="Edit Service"
                                            disabled={isSaving || editingService} // Disable if saving or another service is being edited
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteService(service.id)}
                                            className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors shadow-sm"
                                            title="Delete Service"
                                            disabled={isSaving || editingService} // Disable if saving or another service is being edited
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ServicesManagement;