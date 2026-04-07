import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import { DashboardRefreshProvider } from "./dashboard/DashboardRefreshProvider";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DashboardRefreshProvider>
          <App />
        </DashboardRefreshProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
