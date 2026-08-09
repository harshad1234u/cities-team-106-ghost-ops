import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { RoleGuard } from './components/RoleGuard';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Placeholder from './pages/Placeholder';

import CitizenDashboard from './pages/citizen/CitizenDashboard';
import ReportFlow from './pages/citizen/ReportFlow';
import ReportSuccess from './pages/citizen/ReportSuccess';
import ReportStatus from './pages/citizen/ReportStatus';

import EngineerDashboard from './pages/engineer/EngineerDashboard';
import ReportAssessment from './pages/engineer/ReportAssessment';

import AdminLayout from './pages/admin/AdminLayout';
import CommandCenter from './pages/admin/CommandCenter';
import AdminMap from './pages/admin/AdminMap';
import AdminReports from './pages/admin/AdminReports';
import AdminReportDetail from './pages/admin/AdminReportDetail';
import AIIntelligence from './pages/admin/AIIntelligence';
import EngineersManagement from './pages/admin/EngineersManagement';
import AdminSettings from './pages/admin/AdminSettings';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/signup" element={<Signup />} />

          {/* Citizen Routes */}
          <Route element={<RoleGuard allowedRoles={['citizen']} />}>
            <Route path="/citizen" element={<CitizenDashboard />} />
            <Route path="/citizen/report" element={<ReportFlow />} />
            <Route path="/citizen/success" element={<ReportSuccess />} />
            <Route path="/citizen/status/:id" element={<ReportStatus />} />
          </Route>

          {/* Engineer Routes */}
          <Route element={<RoleGuard allowedRoles={['engineer']} />}>
            <Route path="/engineer" element={<EngineerDashboard />} />
            <Route path="/engineer/reports" element={<Navigate to="/engineer" replace />} />
            <Route path="/engineer/reports/:id" element={<ReportAssessment />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<RoleGuard allowedRoles={['admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<CommandCenter />} />
              <Route path="/admin/map" element={<AdminMap />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/reports/:id" element={<AdminReportDetail />} />
              <Route path="/admin/intelligence" element={<AIIntelligence />} />
              <Route path="/admin/engineers" element={<EngineersManagement />} />
              <Route path="/admin/analytics" element={<Placeholder name="Analytics" />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
