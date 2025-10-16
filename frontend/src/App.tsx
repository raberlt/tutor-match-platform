import { router } from "./router";
import { DashboardProvider } from "./contexts/DashboardContext";
import { AuthProvider } from "./contexts/AuthContext";
import "./utils/debugDashboard"; // Import debug utilities
import "./App.css";
import { RouterProvider } from "react-router-dom";

function App() {
  return (
    <AuthProvider>
      <DashboardProvider>
        <RouterProvider router={router} />
      </DashboardProvider>
    </AuthProvider>
  );
}

export default App;
