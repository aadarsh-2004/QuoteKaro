import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit, Trash2, Check, X,TrendingUp , Loader2, Image, FileText, DollarSign, ToggleRight, ToggleLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
// import WelcomeSection from '../Components/AdminDashboardComponents/'; // Assuming this path

const TemplatesManagement = ({ API_BASE_URL }) => {
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null); // For editing, null for new
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    plan: 'Starter', // Default plan
    description: '',
    image: '',
    isActive: true,
  });

  const planOptions = ['Starter','Basic', 'Professional', 'Enterprise']; // Must match your User and EstimateTemplate model enums

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all templates, including inactive ones, for admin view
      const response = await axios.get(`${API_BASE_URL}/api/templates?includeInactive=true`);
      setTemplates(response.data.templates);
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError('Failed to fetch templates.');
      toast.error('Failed to load templates.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentTemplate(null); // Clear for new template
    setFormData({
      id: '',
      name: '',
      plan: 'Starter',
      description: '',
      image: '',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (template) => {
    setCurrentTemplate(template);
    setFormData({
      id: template.id,
      name: template.name,
      plan: template.plan,
      description: template.description,
      image: template.image,
      isActive: template.isActive,
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (currentTemplate) {
        // Update existing template
        await axios.put(`${API_BASE_URL}/api/templates/${currentTemplate._id}`, formData);
        toast.success('Template updated successfully!');
      } else {
        // Create new template
        await axios.post(`${API_BASE_URL}/api/templates`, formData);
        toast.success('Template created successfully!');
      }
      setIsModalOpen(false);
      fetchTemplates(); // Re-fetch templates to update the list
    } catch (err) {
      console.error('Error saving template:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to save template.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        await axios.delete(`${API_BASE_URL}/api/templates/${templateId}`);
        toast.success('Template deleted successfully!');
        fetchTemplates();
      } catch (err) {
        console.error('Error deleting template:', err.response?.data || err.message);
        toast.error(err.response?.data?.message || 'Failed to delete template.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (isLoading && !templates.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="animate-spin mr-2" size={24} /> Loading Templates...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-900 text-white">
      
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4 text-white flex items-center">
              <TrendingUp className="mr-3" size={32} />
              Template Management
            </h1>
            {/* <p className="text-gray-400 mt-1">Deep insights into user-generated estimates.</p> */}
          </div>
        </div>
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Manage Estimate Templates</h2>
          <button
            onClick={handleAddClick}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors"
          >
            <Plus size={20} className="mr-2" /> Add New Template
          </button>
        </div>

        {templates.length === 0 ? (
          <div className="text-center text-gray-400 py-10">
            No templates found. Click "Add New Template" to create one.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {templates.map((template) => (
                  <tr key={template._id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{template.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{template.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        template.plan === 'Starter' ? 'bg-green-100 text-green-800' :
                        template.plan === 'Professional' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {template.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <img src={template.image} alt={template.name} className="h-10 w-auto rounded-md object-cover"
                        onError={(e) => e.target.src = `https://placehold.co/100x40/333/FFF?text=No+Image`}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {template.isActive ? <Check size={18} className="text-green-500" /> : <X size={18} className="text-red-500" />}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(template)}
                        className="text-indigo-400 hover:text-indigo-600 mr-3"
                        title="Edit Template"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template._id)}
                        className="text-red-400 hover:text-red-600"
                        title="Delete Template"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add/Edit Template */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-6">
              {currentTemplate ? 'Edit Template' : 'Add New Template'}
            </h3>
            <form onSubmit={handleSaveTemplate} className="space-y-4">
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-gray-300 mb-1">Template ID (Unique Slug)</label>
                <input
                  type="text"
                  name="id"
                  id="id"
                  value={formData.id}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., modern-minimal"
                  required
                  disabled={!!currentTemplate} // Disable ID field when editing
                />
              </div>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Template Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Modern Minimal"
                  required
                />
              </div>
              <div>
                <label htmlFor="plan" className="block text-sm font-medium text-gray-300 mb-1">Required Plan</label>
                <select
                  name="plan"
                  id="plan"
                  value={formData.plan}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {planOptions.map(plan => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="A brief description of the template's style."
                ></textarea>
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-1">Image URL</label>
                <input
                  type="url"
                  name="image"
                  id="image"
                  value={formData.image}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/template-preview.jpg"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                  className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-gray-300">Is Active?</label>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white font-semibold transition-colors flex items-center"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <Check size={20} className="mr-2" />}
                  {currentTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplatesManagement;
