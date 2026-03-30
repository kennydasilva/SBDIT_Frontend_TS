import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage";
import Layout from "../components/layout/Layout";
import Dashboard from "../pages/SuperAdmin/Dashboard";
import Admins from "../pages/SuperAdmin/Admins";
import Policiais from "../pages/SuperAdmin/Policiais";
import Cidadaos from "../pages/SuperAdmin/Cidadaos";
import Denuncias from "../pages/SuperAdmin/Denuncias";
import Relatorios from "../pages/SuperAdmin/Relatorios";



export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admins" element={<Admins />} />
        <Route path="/policiais" element={<Policiais />} />
        <Route path="/cidadaos" element={<Cidadaos />} />
        <Route path="/denuncias" element={<Denuncias />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Route>
      
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}