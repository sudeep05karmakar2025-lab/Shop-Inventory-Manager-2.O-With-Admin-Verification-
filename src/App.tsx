import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useStore } from "./store";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Inventory } from "./pages/Inventory";
import { Billing } from "./pages/Billing";
import { BillHistory } from "./pages/BillHistory";
import { PublicBill } from "./pages/PublicBill";
import { Profile } from "./pages/Profile";

function ProtectedRoute({ children, reqRole }: { children: React.ReactNode; reqRole?: "admin" | "staff" }) {
  const { currentUser } = useStore();
  if (!currentUser) return <Navigate to="/login" replace />;
  if (reqRole && currentUser.role !== reqRole && currentUser.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/scan/:id" element={<PublicBill />} />
        
        {/* Protected Admin/Staff Routes */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
                <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/bills" element={<ProtectedRoute><BillHistory /></ProtectedRoute>} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}
