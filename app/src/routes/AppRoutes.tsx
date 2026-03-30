// routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage";
import RouteGuard from "../components/protect/RouteGuard";

// Super Admin Layout e Pages
import SuperAdminLayout from "../components/layout/Layout";
import SuperAdminDashboard from "../pages/SuperAdmin/Dashboard";
import SuperAdminAdmins from "../pages/SuperAdmin/Admins";
import SuperAdminPoliciais from "../pages/SuperAdmin/Policiais";
import SuperAdminCidadaos from "../pages/SuperAdmin/Cidadaos";
import SuperAdminDenuncias from "../pages/SuperAdmin/Denuncias";

// Admin Layout e Pages
import AdminLayout from "../components/layout/AdminLayout";
import AdminDashboard from "../pages/Admin/Dashboard";
import AdminPoliciais from "../pages/Admin/Policias";
/*import AdminDenuncias from "../pages/Admin/Denuncias";

// Policial Layout e Pages
import PolicialLayout from "../layouts/PolicialLayout";
import PolicialDashboard from "../pages/Policial/Dashboard";
import PolicialDenuncias from "../pages/Policial/Denuncias";

// Cidadão Layout e Pages
import CidadaoLayout from "../layouts/CidadaoLayout";
import CidadaoDashboard from "../pages/Cidadao/Dashboard";
import CidadaoNovaDenuncia from "../pages/Cidadao/NovaDenuncia";*/

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rotas Protegidas */}
      <Route element={<RouteGuard />}>
        {/* Super Admin Routes */}
        <Route element={<SuperAdminLayout />}>
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/admins" element={<SuperAdminAdmins />} />
          <Route path="/super-admin/policiais" element={<SuperAdminPoliciais />} />
          <Route path="/super-admin/cidadaos" element={<SuperAdminCidadaos />} />
          <Route path="/super-admin/denuncias" element={<SuperAdminDenuncias />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/policiais" element={<AdminPoliciais />} />
          {/*<Route path="/admin/denuncias" element={<AdminDenuncias />} />*/}
        </Route>

        {/* Policial Routes 
        <Route element={<PolicialLayout />}>
          <Route path="/policial/dashboard" element={<PolicialDashboard />} />
          <Route path="/policial/denuncias" element={<PolicialDenuncias />} />
        </Route>*/}

        {/* Cidadão Routes 
        <Route element={<CidadaoLayout />}>
          <Route path="/cidadao/dashboard" element={<CidadaoDashboard />} />
          <Route path="/cidadao/nova-denuncia" element={<CidadaoNovaDenuncia />} />
        </Route>*/}
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}