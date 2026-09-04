// routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../pages/Login/LoginPage";
import SignupPage from "../pages/Signup/SignupPage";
import RecuperarSenhaPage from "../pages/RecuperarSenha/RecuperarSenhaPage";
import RedefinirSenhaPage from "../pages/RecuperarSenha/RedefinirSenhaPage";
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
import CidadaoLayout from "../components/layout/CidadaoLayout";
import CidadaoDashboard from "../pages/cidadao/CidadaoDashboard";
import CriarDenuncia from "../pages/cidadao/CriarDenuncia";
import DetalhesDenuncia from "../pages/cidadao/DetalhesDenuncia";
import MinhasDenuncias from "../pages/cidadao/MinhasDenuncias";
import CidadaoPerfil from "../pages/cidadao/CidadaoPerfil";
import PTLayout from "../components/layout/PTLayout";
import DashboardPt from "../pages/PT/PtDashboard";
import DenunciasPt from "../pages/PT/DenunciasPt";
import MinhasDecisoesPt from "../pages/PT/MinhasDecisoesPt";
import DetalhesDenunciaPt from "../pages/PT/DetalhesDenunciaPt";
import PerfilPt from "../pages/PT/PerfilPt";
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
      <Route path="/cadastrar" element={<SignupPage />} />
      <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
      <Route path="/redefinir-senha/:uid/:token" element={<RedefinirSenhaPage />} />

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

         

      
        <Route element={<PTLayout />}>
          <Route path="/pt/dashboard" element={<DashboardPt />} />
          <Route path="/pt/denuncias" element={<DenunciasPt />} />
          <Route path="/pt/minhas-decisoes" element={<MinhasDecisoesPt />} />
          <Route path="/pt/perfil" element={<PerfilPt />} />
          <Route path="/pt/denuncias/:id" element={<DetalhesDenunciaPt />} /> 
        </Route>

        {/* Cidadão Routes */}
        <Route element={<CidadaoLayout />}>
          <Route path="/cidadao/dashboard" element={<CidadaoDashboard />} />
          <Route path="/cidadao/criar-denuncia" element={<CriarDenuncia />} />
          <Route path="/cidadao/denuncias/:id" element={<DetalhesDenuncia />} />
          <Route path="/cidadao/minhas-denuncias" element={<MinhasDenuncias />} />
          <Route path="/cidadao/perfil" element={<CidadaoPerfil />} />

        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}