import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/Layout";
import { CaseDetailPage } from "./pages/CaseDetailPage";
import { DashboardPage } from "./pages/DashboardPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="cases/:id" element={<CaseDetailPage />} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
