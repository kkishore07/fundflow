import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GlobalProvider } from "@/context/GlobalContext";
import ProtectedRoute from "@/components/ProtectedRoute";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Donor
import UserDashboard from "./pages/UserDashboard";
import CampaignsList from "./pages/CampaignsList";
import Donate from "./pages/Donate";
import MyDonations from "./pages/MyDonations";

// Creator
import CreatorDashboard from "./pages/CreatorDashboard";
import CreateCampaign from "./pages/CreateCampaign";
import EditCampaign from "./pages/EditCampaign";
import ActiveCampaigns from "./pages/ActiveCampaigns";
import Analytics from "./pages/Analytics";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import CampaignApproval from "./pages/CampaignApproval";
import ManageUsers from "./pages/ManageUsers";
import RefundRequests from "./pages/RefundRequests";
import SuspiciousDonations from "./pages/SuspiciousDonations";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GlobalProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Donor routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["user"]}><UserDashboard /></ProtectedRoute>} />
            <Route path="/campaigns" element={<ProtectedRoute><CampaignsList /></ProtectedRoute>} />
            <Route path="/campaigns/:id" element={<ProtectedRoute><Donate /></ProtectedRoute>} />
            <Route path="/my-donations" element={<ProtectedRoute allowedRoles={["user"]}><MyDonations /></ProtectedRoute>} />

            {/* Creator routes */}
            <Route path="/creator/dashboard" element={<ProtectedRoute allowedRoles={["creator"]}><CreatorDashboard /></ProtectedRoute>} />
            <Route path="/creator/campaigns" element={<ProtectedRoute allowedRoles={["creator"]}><ActiveCampaigns /></ProtectedRoute>} />
            <Route path="/creator/create" element={<ProtectedRoute allowedRoles={["creator"]}><CreateCampaign /></ProtectedRoute>} />
            <Route path="/creator/edit/:id" element={<ProtectedRoute allowedRoles={["creator"]}><EditCampaign /></ProtectedRoute>} />
            <Route path="/creator/analytics" element={<ProtectedRoute allowedRoles={["creator"]}><Analytics /></ProtectedRoute>} />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/approvals" element={<ProtectedRoute allowedRoles={["admin"]}><CampaignApproval /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin"]}><ManageUsers /></ProtectedRoute>} />
            <Route path="/admin/refunds" element={<ProtectedRoute allowedRoles={["admin"]}><RefundRequests /></ProtectedRoute>} />
            <Route path="/admin/suspicious" element={<ProtectedRoute allowedRoles={["admin"]}><SuspiciousDonations /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </GlobalProvider>
  </QueryClientProvider>
);

export default App;
