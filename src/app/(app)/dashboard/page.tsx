"use client";

import DashboardPageClient from "@/components/dashboard/DashboardPageClient";
import StaffWelcomeDashboard from "@/components/dashboard/StaffWelcomeDashboard";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  if (user?.role === "STAFF") return <StaffWelcomeDashboard />;
  return <DashboardPageClient />;
}
