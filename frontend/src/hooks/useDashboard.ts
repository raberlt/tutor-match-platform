import { useContext } from "react";
import { DashboardContext } from "../contexts/DashboardContext";
import type { DashboardContextType } from "../types/dashboard";

// Custom Hook để sử dụng Dashboard Context
export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

