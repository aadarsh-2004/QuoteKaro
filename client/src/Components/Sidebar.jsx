import React, { useState, useRef, useEffect } from "react";
import {
  LayoutGrid,
  Settings,
  ChevronRight,
  ChevronLeft,
  User,
  ChevronDown,
  ChevronUp,
  Shield,
  FileText,
  CreditCard,
} from "lucide-react";
import { PiNotepadBold } from "react-icons/pi";
import { LuNotebookPen } from "react-icons/lu";
import { BsCreditCard } from "react-icons/bs";
import { RiLogoutBoxLine } from "react-icons/ri";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signOut , onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { useUser } from '../context/UserContext';
const Sidebar = () => {
  const { userData,logout } = useUser();
  
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
  const [mobileSettingsOpen, setMobileSettingsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Separate menu items for mobile (excluding settings) and desktop (including settings)
  const mobileMenuItems = [
    {
      id: "dashboard",
      icon: LayoutGrid,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      id: "my-estimates",
      icon: PiNotepadBold,
      label: "My Estimates",
      path: "/my-estimates",
    },
    {
      id: "new-estimate",
      icon: LuNotebookPen,
      label: "New Estimate",
      path: "/new-estimate",
    },
    {
      id: "plan-credits",
      icon: BsCreditCard,
      label: "Plan & Credits",
      path: "/plan-credits",
    },
  ];

  const desktopMenuItems = [
    {
      id: "dashboard",
      icon: LayoutGrid,
      label: "Dashboard",
      path: "/dashboard",
    },
    {
      id: "my-estimates",
      icon: PiNotepadBold,
      label: "My Estimates",
      path: "/my-estimates",
    },
    {
      id: "new-estimate",
      icon: LuNotebookPen,
      label: "New Estimate",
      path: "/new-estimate",
    },
    {
      id: "plan-credits",
      icon: BsCreditCard,
      label: "Plan & Credits",
      path: "/plan-credits",
    },
    { id: "settings", icon: Settings, label: "Settings", path: "/settings" },
  ];

  const settingsSubItems = [
    { id: "profile", icon: User, label: "Profile", path: "/settings/profile" },
    {
      id: "preferences",
      icon: FileText,
      label: "Preferences",
      path: "/settings/preferences",
    },
    {
      id: "security",
      icon: Shield,
      label: "Security",
      path: "/forgot-password",
    },
    
    
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMobileSettingsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Sign out from Firebase
      await signOut(auth);
      logout();
      
      localStorage.removeItem("firebaseId");
      
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };
   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });

    return () => unsubscribe();
  }, []);


   if(!userData  ) return null;

   
  const getUserInfo = () => {
    if (firebaseUser) {
      return {
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL
      };
    }
    return {
      name: 'User',
      email: '',
      avatar: null
    };
  };

  const userInfo =  getUserInfo();
  // console.log(userInfo)

 
  

  const isSettingsActive = window.location.pathname.startsWith("/settings");
  const isSubItemActive = (path) => window.location.pathname === path;

  const handleSettingsClick = (e) => {
    e.preventDefault();
    if (window.innerWidth < 768) {
      // Mobile view - toggle dropdown
      setMobileSettingsOpen(!mobileSettingsOpen);
    } else if (isOpen) {
      // Desktop expanded - toggle submenu
      setIsSettingsExpanded(!isSettingsExpanded);
    } else {
      // Desktop collapsed - show dropdown
      setMobileSettingsOpen(!mobileSettingsOpen);
    }
  };

 

  return (
    <div className="flex md:flex-row flex-col md:h-screen">
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex bg-white backdrop-blur-3xl border border-gray-200 rounded-3xl m-4 shadow-sm transition-all duration-300 ease-in-out flex-col ${
          isOpen ? "w-64" : "w-18"
        }`}
      >
        {/* Desktop Toggle Button */}
        <div className="p-3 border-b border-gray-100">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-center p-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            {isOpen ? (
              <ChevronLeft size={20} className="text-gray-600" />
            ) : (
              <ChevronRight size={20} className="text-gray-600" />
            )}
          </button>
        </div>

        {/* Desktop Menu Items */}
        <nav className="flex-1 p-2 space-y-2 relative z-50">
          {desktopMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.id === "settings") {
              return (
                <div key={item.id} className="relative">
                  {/* Settings Button */}
                  <button
                    onClick={handleSettingsClick}
                    className={`w-full flex items-center gap-3 p-4 mb-2 rounded-xl transition-all duration-200 ${
                      isSettingsActive
                        ? "bg-purple-100 text-purple-500 border-2 border-purple-300"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                    title={!isOpen ? "Settings" : ""}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {isOpen && (
                      <>
                        <span className="font-medium text-sm whitespace-nowrap">
                          Settings
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 ml-auto transition-transform ${
                            isSettingsExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>

                  {/* Expanded Settings (open sidebar) */}
                  {isOpen && isSettingsExpanded && (
                    <div className="ml-3 mt-2 space-y-1 border-l-2 border-gray-100 pl-3">
                      {settingsSubItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <Link
                            key={subItem.id}
                            to={subItem.path}
                            className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all duration-200 text-sm ${
                              isSubItemActive(subItem.path)
                                ? "bg-purple-50 text-purple-600 font-medium"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            }`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSubItemActive(subItem.path)
                                  ? "bg-purple-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            {subItem.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Collapsed Dropdown (when sidebar is closed) */}
                  {!isOpen && mobileSettingsOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute left-full top-0 ml-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48"
                    >
                      <div className="px-3 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
                        Settings
                      </div>
                      {settingsSubItems.map((subItem) => {
                        const SubIcon = subItem.icon;
                        return (
                          <Link
                            key={subItem.id}
                            to={subItem.path}
                            className={`flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                              isSubItemActive(subItem.path)
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                            onClick={() => setMobileSettingsOpen(false)}
                          >
                            <SubIcon className="w-4 h-4" />
                            <span>{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Default menu items
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-3 p-4 mb-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-purple-100 text-purple-500 border-2 border-purple-300"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
                title={!isOpen ? item.label : ""}
              >
                <Icon size={20} className="flex-shrink-0" />
                {isOpen && (
                  <span className="font-medium text-sm whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Profile & Logout Section */}
        <div className="p-3 border-t border-gray-100">
          {/* Profile Info */}
          {isOpen && (
            <div className="mb-3 p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                  {userData.logoUrl ? (
                    <img
                      src={userData.logoUrl}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div >
                      {userInfo.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {userInfo.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {userInfo.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed ${
              !isOpen ? "justify-center" : ""
            }`}
            title={!isOpen ? "Logout" : ""}
          >
            {isLoggingOut ? (
              <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin flex-shrink-0" />
            ) : (
              <RiLogoutBoxLine size={20} className="flex-shrink-0" />
            )}
            {isOpen && (
              <span className="font-medium text-sm whitespace-nowrap">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Top Navigation - Horizontal Icons */}
      <div className="md:hidden bg-white border border-gray-200 rounded-3xl mx-4 mt-4 shadow-sm">
        <nav className="flex items-center justify-between p-3">
          {/* Regular menu items (excluding settings) */}
          {mobileMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = window.location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-purple-100 text-purple-500 border border-purple-300"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                }`}
              >
                <Icon size={20} />
              </Link>
            );
          })}

          {/* Mobile Settings Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={handleSettingsClick}
              className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${
                isSettingsActive
                  ? "bg-purple-100 text-purple-500 border border-purple-300"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`}
            >
              <Settings size={20} />
            </button>

            {/* Mobile Dropdown Menu - Fixed positioning */}
            {mobileSettingsOpen && (
              <div className="absolute right-0  mb-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                <div className="p-2">
                  <Link
                    to="/settings"
                    onClick={() => setMobileSettingsOpen(false)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                      window.location.pathname === "/settings"
                        ? "bg-purple-50 text-purple-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Settings size={16} />
                    <span className="text-sm font-medium" >All Settings</span>
                    
                  </Link>

                  <div className="border-t border-gray-100 my-2"></div>
                  

                  {settingsSubItems.map((subItem) => (
                    <Link
                      key={subItem.id}
                      to={subItem.path}
                      onClick={() => setMobileSettingsOpen(false)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all duration-200 text-left ${
                        isSubItemActive(subItem.path)
                          ? "bg-purple-50 text-purple-600"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSubItemActive(subItem.path)
                            ? "bg-purple-500"
                            : "bg-gray-300"
                        }`}
                      />
                      <span className="text-sm">{subItem.label}</span>
                    </Link>
                    
                  ))}
                  <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed ${
              !isOpen ? "justify-center" : ""
            }`}
            title={!isOpen ? "Logout" : ""}
          >
            {isLoggingOut ? (
              <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin flex-shrink-0" />
            ) : (
              <RiLogoutBoxLine size={20} className="flex-shrink-0" />
            )}
            {isOpen && (
              <span className="font-medium text-sm whitespace-nowrap">
                {isLoggingOut ? "Logging out..." : "Logout"}
              </span>
            )}
          </button>
                </div>
                
              </div>
            )}
          </div>
        </nav>

        {/* Click outside to close mobile dropdown */}
        {mobileSettingsOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setMobileSettingsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
