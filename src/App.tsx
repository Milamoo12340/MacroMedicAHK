import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Overview from "@/pages/Overview";
import KnowledgeBase from "@/pages/KnowledgeBase";
import Commands from "@/pages/Commands";
import Tickets from "@/pages/Tickets";
import Settings from "@/pages/Settings";
import TicketPreview from "@/pages/TicketPreview";
import Login from "@/pages/Login";
import StaffAccounts from "@/pages/StaffAccounts";
import AIProvider from "@/pages/AIProvider";
import DiscordIntegration from "@/pages/DiscordIntegration";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/features/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "hsl(222 22% 10%)",
            border: "1px solid hsl(220 16% 18%)",
            color: "hsl(180 8% 94%)",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "13px",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/preview" element={<TicketPreview />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Overview />} />
            <Route path="/dashboard/knowledge" element={<KnowledgeBase />} />
            <Route path="/dashboard/commands" element={<Commands />} />
            <Route path="/dashboard/tickets" element={<Tickets />} />
            <Route path="/dashboard/discord" element={<DiscordIntegration />} />
            <Route path="/dashboard/ai" element={<AIProvider />} />
            <Route path="/dashboard/staff" element={<StaffAccounts />} />
            <Route path="/dashboard/settings" element={<Settings />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
