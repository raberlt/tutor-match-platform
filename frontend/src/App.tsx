import { AppRouter } from "./router";
import { DashboardProvider } from "./contexts/DashboardContext";
import "./utils/debugDashboard"; // Import debug utilities
import "./App.css";

function App() {
  return (
    <DashboardProvider>
      <AppRouter />
    </DashboardProvider>
  );
}

export default App;
