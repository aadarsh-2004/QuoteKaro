import React from "react";
import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex md:flex-row flex-col md:h-screen">
        <Sidebar />
        {children}
      </div>
    </div>
  );
};

export default Layout;
