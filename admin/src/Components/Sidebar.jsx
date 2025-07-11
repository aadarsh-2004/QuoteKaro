import React from 'react';
import {
  LayoutDashboard, Users, CreditCard, BarChart3, DollarSign,
  Mail, Database, Settings, Headphones, Bot, Menu, X, Image as ImageIcon, // Import Image icon for templates
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation(); // Hook to get current URL location
  const navigate = useNavigate(); // Hook to programmatically navigate

  // Define sidebar items with their corresponding paths
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { id: 'users', label: 'User Management', icon: Users, path: '/usermanagement' },
    { id: 'plans', label: 'Plans & Credits', icon: CreditCard, path: '/plancreditmanagement' },
    { id: 'templates', label: 'Templates', icon: ImageIcon, path: '/templates' }, // New Templates link
    { id: 'analytics', label: 'Estimate Analytics', icon: BarChart3, path: '/estimateanalytics' },
    { id: 'payments', label: 'Payments', icon: DollarSign, path: '/paymentstransactions' },
    { id: 'notifications', label: 'Email & Notifications', icon: Mail, path: '/emailnotificationsystem' },
    { id: 'support', label: 'Helpdesk / Support', icon: Headphones, path: '/helpdesksupport' },
    { id: 'ai', label: 'AI & Automation', icon: Bot, path: '/aiautomationsystem' },
    { id: 'export', label: 'Data Export & Backup', icon: Database, path: '/dataexportbackup' }, // Placeholder for future page
    { id: 'settings', label: 'Admin Settings', icon: Settings, path: '/adminsettings' }, // Placeholder for future page
  ];

  // Determine active section based on current URL path
  const activeSectionId = location.pathname === '/'
    ? 'dashboard'
    : sidebarItems.find(item => item.path === location.pathname)?.id;

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-gray-800 border-r border-gray-700 flex flex-col fixed h-full z-10`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {sidebarOpen && <h2 className="text-xl font-bold text-white">Admin Panel</h2>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)} // Use navigate to change routes
                className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                  activeSectionId === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="ml-3 font-medium text-left">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">A</span>
          </div>
          {sidebarOpen && (
            <div className="ml-3">
              <p className="text-white text-sm font-medium">Admin User</p>
              <p className="text-gray-400 text-xs">Super Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
