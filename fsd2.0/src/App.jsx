import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { OperationsProvider } from './context/OperationsContext';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { OverviewPage } from './pages/OverviewPage';
import { TurbinesPage } from './pages/TurbinesPage';
import { TurbineDetailPage } from './pages/TurbineDetailPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { InspectionsPage } from './pages/InspectionsPage';
import { MarineWeatherPage } from './pages/MarineWeatherPage';
import { VesselOperationsPage } from './pages/VesselOperationsPage';
import { PerformancePage } from './pages/PerformancePage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <AuthProvider>
      <OperationsProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Mission-Control Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<OverviewPage />} />
              <Route path="/turbines" element={<TurbinesPage />} />
              <Route path="/turbines/:id" element={<TurbineDetailPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/inspections" element={<InspectionsPage />} />
              <Route path="/weather" element={<MarineWeatherPage />} />
              <Route path="/vessels" element={<VesselOperationsPage />} />
              <Route path="/performance" element={<PerformancePage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </OperationsProvider>
    </AuthProvider>
  );
}

export default App;
