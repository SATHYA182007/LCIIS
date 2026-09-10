import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { SimulationProvider } from './context/SimulationContext';
import { SidebarProvider } from './context/SidebarContext';

// Pages
import { LandingPage } from './pages/Landing/LandingPage';
import { AuthPage } from './pages/Auth/AuthPage';
import { DoctorDashboard } from './pages/Doctor/DoctorDashboard';
import { DoctorPatientsPage } from './pages/Doctor/DoctorPatientsPage';
import { DoctorLabResultsPage } from './pages/Doctor/DoctorLabResultsPage';
import { DoctorVitalsPage } from './pages/Doctor/DoctorVitalsPage';
import { DoctorAlertsPage } from './pages/Doctor/DoctorAlertsPage';
import { PatientDetailsPage } from './pages/Doctor/PatientDetailsPage';
import { PatientLabDetailsPage } from './pages/Doctor/PatientLabDetailsPage';
import { PatientVitalsDetailsPage } from './pages/Doctor/PatientVitalsDetailsPage';

import { NurseDashboard } from './pages/Nurse/NurseDashboard';
import { NursePatientsPage } from './pages/Nurse/NursePatientsPage';
import { NurseVitalsPage } from './pages/Nurse/NurseVitalsPage';
import { NurseAlertsPage } from './pages/Nurse/NurseAlertsPage';
import { NurseObservationsPage } from './pages/Nurse/NurseObservationsPage';

import { LaboratoryDashboard } from './pages/Laboratory/LaboratoryDashboard';
import { LaboratoryPatientsPage } from './pages/Laboratory/LaboratoryPatientsPage';
import { LaboratoryResultsPage } from './pages/Laboratory/LaboratoryResultsPage';

import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminUsersPage } from './pages/Admin/AdminUsersPage';
import { AdminPatientsPage } from './pages/Admin/AdminPatientsPage';
import { AdminSettingsPage } from './pages/Admin/AdminSettingsPage';
import { InventoryPage } from './pages/Admin/InventoryPage';
import { ExpiryCenterPage } from './pages/Admin/ExpiryCenterPage';
import { DevicesPage } from './pages/Admin/DevicesPage';
import { AuditLogsPage } from './pages/Admin/AuditLogsPage';
import { SimulationPage } from './pages/Simulation/SimulationPage';
import { DeviceMonitorPage } from './pages/DeviceMonitor/DeviceMonitorPage';
import { SystemArchitecturePage } from './pages/Architecture/SystemArchitecturePage';
import { HardwareIntegrationPage } from './pages/HardwareIntegration/HardwareIntegrationPage';
import { ReportsPage } from './pages/Reports/ReportsPage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RealtimeProvider>
          <SimulationProvider>
            <SidebarProvider>
              {/* Global Toast Feedback */}
            <Toaster position="top-right" richColors />

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
              <Route path="/doctor/patients/:id" element={<PatientDetailsPage />} />
              <Route path="/doctor/patients/:id/labs" element={<PatientLabDetailsPage />} />
              <Route path="/doctor/patients/:id/vitals" element={<PatientVitalsDetailsPage />} />
              <Route path="/doctor/trends" element={<DoctorLabResultsPage />} />
              <Route path="/doctor/vitals" element={<DoctorVitalsPage />} />
              <Route path="/doctor/risk" element={<DoctorDashboard />} />
              <Route path="/doctor/alerts" element={<DoctorAlertsPage />} />

              {/* Nurse Routes */}
              <Route path="/nurse/dashboard" element={<NurseDashboard />} />
              <Route path="/nurse/patients" element={<NursePatientsPage />} />
              <Route path="/nurse/monitoring" element={<NurseVitalsPage />} />
              <Route path="/nurse/alerts" element={<NurseAlertsPage />} />
              <Route path="/nurse/observations" element={<NurseObservationsPage />} />

              {/* Laboratory Routes */}
              <Route path="/laboratory/dashboard" element={<LaboratoryDashboard />} />
              <Route path="/laboratory/patients" element={<LaboratoryPatientsPage />} />
              <Route path="/laboratory/results" element={<LaboratoryResultsPage />} />
              <Route path="/laboratory/reports" element={<ReportsPage />} />
              <Route path="/laboratory/history" element={<LaboratoryResultsPage />} />

              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/patients" element={<AdminPatientsPage />} />
              <Route path="/admin/inventory" element={<InventoryPage />} />
              <Route path="/admin/inventory/movements" element={<InventoryPage />} />
              <Route path="/admin/expiry" element={<ExpiryCenterPage />} />
              <Route path="/admin/devices" element={<DevicesPage />} />
              <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />

              {/* Shared Hardware & Simulation Routes */}
              <Route path="/simulation" element={<SimulationPage />} />
              <Route path="/device-monitor" element={<DeviceMonitorPage />} />
              <Route path="/system-architecture" element={<SystemArchitecturePage />} />
              <Route path="/hardware-integration" element={<HardwareIntegrationPage />} />
              <Route path="/reports" element={<ReportsPage />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </SidebarProvider>
          </SimulationProvider>
        </RealtimeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
