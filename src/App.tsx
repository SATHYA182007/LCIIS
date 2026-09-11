import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { SimulationProvider } from './context/SimulationContext';
import { SidebarProvider } from './context/SidebarContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public & Shared Pages
import { LandingPage } from './pages/Landing/LandingPage';
import { AuthPage } from './pages/Auth/AuthPage';

// Receptionist Pages
import { ReceptionistDashboard } from './pages/Receptionist/ReceptionistDashboard';
import { RegisterPatientPage } from './pages/Receptionist/RegisterPatientPage';
import { ReceptionistPatientsPage } from './pages/Receptionist/ReceptionistPatientsPage';
import { PatientSearchPage } from './pages/Receptionist/PatientSearchPage';

// Doctor Pages
import { DoctorDashboard } from './pages/Doctor/DoctorDashboard';
import { DoctorPatientsPage } from './pages/Doctor/DoctorPatientsPage';
import { DoctorLabResultsPage } from './pages/Doctor/DoctorLabResultsPage';
import { DoctorVitalsPage } from './pages/Doctor/DoctorVitalsPage';
import { DoctorAlertsPage } from './pages/Doctor/DoctorAlertsPage';
import { PatientDetailsPage } from './pages/Doctor/PatientDetailsPage';
import { PatientLabDetailsPage } from './pages/Doctor/PatientLabDetailsPage';
import { PatientVitalsDetailsPage } from './pages/Doctor/PatientVitalsDetailsPage';

// Nurse Pages
import { NurseDashboard } from './pages/Nurse/NurseDashboard';
import { NursePatientsPage } from './pages/Nurse/NursePatientsPage';
import { NurseVitalsPage } from './pages/Nurse/NurseVitalsPage';
import { NurseAlertsPage } from './pages/Nurse/NurseAlertsPage';
import { NurseObservationsPage } from './pages/Nurse/NurseObservationsPage';

// Laboratory Pages
import { LaboratoryDashboard } from './pages/Laboratory/LaboratoryDashboard';
import { LaboratoryPatientsPage } from './pages/Laboratory/LaboratoryPatientsPage';
import { LaboratoryResultsPage } from './pages/Laboratory/LaboratoryResultsPage';

// Admin Pages
import { AdminDashboard } from './pages/Admin/AdminDashboard';
import { AdminUsersPage } from './pages/Admin/AdminUsersPage';
import { AdminPatientsPage } from './pages/Admin/AdminPatientsPage';
import { AdminSettingsPage } from './pages/Admin/AdminSettingsPage';
import { InventoryPage } from './pages/Admin/InventoryPage';
import { ExpiryCenterPage } from './pages/Admin/ExpiryCenterPage';
import { DevicesPage } from './pages/Admin/DevicesPage';
import { AuditLogsPage } from './pages/Admin/AuditLogsPage';

// Shared Telemetry & Simulation Pages
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
                {/* Public Authentication Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/signin" element={<AuthPage initialMode="signin" />} />
                <Route path="/signup" element={<AuthPage initialMode="signup" />} />
                <Route path="/forgot-password" element={<AuthPage initialMode="forgot-password" />} />

                {/* Receptionist Auth Routes */}
                <Route path="/receptionist/login" element={<AuthPage initialMode="signin" forcedRole="receptionist" />} />
                <Route path="/receptionist/signup" element={<AuthPage initialMode="signup" forcedRole="receptionist" />} />

                {/* Admin Auth Routes */}
                <Route path="/admin/login" element={<AuthPage initialMode="signin" forcedRole="admin" />} />
                <Route path="/admin/signup" element={<AuthPage initialMode="signup" forcedRole="admin" />} />

                {/* Protected Receptionist Routes */}
                <Route
                  path="/receptionist/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                      <ReceptionistDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/receptionist/register-patient"
                  element={
                    <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                      <RegisterPatientPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/receptionist/patients"
                  element={
                    <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                      <ReceptionistPatientsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/receptionist/search"
                  element={
                    <ProtectedRoute allowedRoles={['receptionist', 'admin']}>
                      <PatientSearchPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Doctor Routes */}
                <Route
                  path="/doctor/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/patients"
                  element={
                    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                      <DoctorPatientsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/patients/:id"
                  element={
                    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                      <PatientDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/patients/:id/labs"
                  element={
                    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                      <PatientLabDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/patients/:id/vitals"
                  element={
                    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                      <PatientVitalsDetailsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/trends"
                  element={
                    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                      <DoctorLabResultsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/vitals"
                  element={
                    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                      <DoctorVitalsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/risk"
                  element={
                    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/alerts"
                  element={
                    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                      <DoctorAlertsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Nurse Routes */}
                <Route
                  path="/nurse/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['nurse', 'admin']}>
                      <NurseDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/nurse/patients"
                  element={
                    <ProtectedRoute allowedRoles={['nurse', 'admin']}>
                      <NursePatientsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/nurse/monitoring"
                  element={
                    <ProtectedRoute allowedRoles={['nurse', 'admin']}>
                      <NurseVitalsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/nurse/alerts"
                  element={
                    <ProtectedRoute allowedRoles={['nurse', 'admin']}>
                      <NurseAlertsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/nurse/observations"
                  element={
                    <ProtectedRoute allowedRoles={['nurse', 'admin']}>
                      <NurseObservationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Laboratory Routes */}
                <Route
                  path="/laboratory/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['laboratory', 'admin']}>
                      <LaboratoryDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/laboratory/patients"
                  element={
                    <ProtectedRoute allowedRoles={['laboratory', 'admin']}>
                      <LaboratoryPatientsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/laboratory/results"
                  element={
                    <ProtectedRoute allowedRoles={['laboratory', 'admin']}>
                      <LaboratoryResultsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/laboratory/reports"
                  element={
                    <ProtectedRoute allowedRoles={['laboratory', 'admin']}>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/laboratory/history"
                  element={
                    <ProtectedRoute allowedRoles={['laboratory', 'admin']}>
                      <LaboratoryResultsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminUsersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/patients"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPatientsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/inventory"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <InventoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/inventory/movements"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <InventoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/expiry"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ExpiryCenterPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/devices"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DevicesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminSettingsPage />
                    </ProtectedRoute>
                  }
                />

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
