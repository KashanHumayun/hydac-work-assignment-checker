import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import NewAssessmentPage from "./pages/NewAssessmentPage";
import SummaryPage from "./pages/SummaryPage";
import RulesAdminPage from "./pages/RulesAdminPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<NewAssessmentPage />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/admin/rules" element={<RulesAdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
