import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  DollarSign,
  Mail,
  Database,
  Settings,
  Headphones,
  Bot,
  
} from "lucide-react";

// Import refactored components
import AdminSidebar from "../Components/AdminDashboardComponents/AdminSidebar";
import DashboardOverview from "../Components/AdminDashboardComponents/DashboardOverview";
import UserManagement from "./UserManagement";
import PlanCreditManagement from "./PlanCreditManagement";
import EstimateAnalytics from "./EstimateAnalytics";
import PaymentsTransactions from "./PaymentsTransactions";
import EmailNotificationSystem from "./EmailNotificationSystem";
import HelpdeskSupport from "./HelpdeskSupport";
import AIAutomationSystem from "./AIAutomationSystem";
import TemplatesManagement from "./TemplatesManagement";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "plans", label: "Plans & Credits", icon: CreditCard },
    { id: "templates", label: "Templates", icon: Settings },
    { id: "analytics", label: "Estimate Analytics", icon: BarChart3 },
    { id: "payments", label: "Payments ", icon: DollarSign },
    { id: "notifications", label: "Email & Notifications", icon: Mail },
    { id: "export", label: "Data Export & Backup", icon: Database },
    { id: "settings", label: "Admin Settings", icon: Settings },
    { id: "support", label: "Helpdesk / Support", icon: Headphones },
    { id: "ai", label: "AI & Automation", icon: Bot },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardOverview API_BASE_URL={API_BASE_URL} />;
      case "users":
        return <UserManagement API_BASE_URL={API_BASE_URL} />; // Pass API_BASE_URL if needed
      case "plans":
        return <PlanCreditManagement API_BASE_URL={API_BASE_URL} />; // New case for Templates Management
      case "templates":
        return <TemplatesManagement API_BASE_URL={API_BASE_URL} />; // Pass API_BASE_URL if needed
      case "analytics":
        return <EstimateAnalytics API_BASE_URL={API_BASE_URL} />; // Pass API_BASE_URL if needed
      case "payments":
        return <PaymentsTransactions API_BASE_URL={API_BASE_URL} />; // Pass API_BASE_URL if needed
      case "notifications":
        return <EmailNotificationSystem API_BASE_URL={API_BASE_URL} />; // Pass API_BASE_URL if needed
      case "support":
        return <HelpdeskSupport API_BASE_URL={API_BASE_URL} />; // Pass API_BASE_URL if needed
      case "ai":
        return <AIAutomationSystem API_BASE_URL={API_BASE_URL} />; // Pass API_BASE_URL if needed

      default:
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white mb-2">
                {sidebarItems.find((item) => item.id === activeSection)?.label}
              </h2>
              <p className="text-gray-400">
                This section is coming next! Let me know when you're ready for
                it.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <AdminSidebar
        sidebarItems={sidebarItems}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">{renderContent()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
