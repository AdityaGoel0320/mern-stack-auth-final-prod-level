import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";

const ProtectedLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default ProtectedLayout;