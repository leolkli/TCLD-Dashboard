import { createBrowserRouter, Navigate, createRoutesFromElements, Route } from 'react-router-dom';
import { ProtectedRoute } from '@components/auth/ProtectedRoute';
import { AntdLayout } from '@components/layout/AntdLayout';
import { LoginPage } from '@pages/auth/LoginPage';
import { DashboardPage } from '@pages/dashboard/DashboardPage';
import { DashboardViewerPage } from '@pages/dashboard/DashboardViewerPage';
import { BuildingsPage } from '@pages/buildings/BuildingsPage';
import { BuildingDetailPage } from '@pages/buildings/BuildingDetailPage';
import { AdminPage } from '@pages/admin/AdminPage';
import { UserManagementPage } from '@pages/admin/UserManagementPage';
import { DashboardTemplatesPage } from '@pages/admin/DashboardTemplatesPage';
import { VtagManagementPage } from '@pages/admin/VtagManagementPage';
import { VtagConfiguratorPage } from '@pages/admin/VtagConfiguratorPage';
import { WidgetConfiguratorPage } from '@pages/admin/WidgetConfiguratorPage';
import { NotFoundPage } from '@pages/NotFoundPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AntdLayout />}>
          {/* Dashboard - default landing */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* Portfolio & Building dashboard viewers */}
          <Route path="/portfolio/:portfolioName/dashboard" element={<DashboardViewerPage />} />
          <Route path="/buildings/:code/dashboard" element={<DashboardViewerPage />} />
          <Route path="/buildings/:code/dashboard/:dashId" element={<DashboardViewerPage />} />

          {/* Settings Redirect */}
          <Route path="/settings" element={<Navigate to="/buildings" replace />} />

          {/* Buildings (Ptag) */}
          <Route path="/buildings" element={<BuildingsPage />} />
          <Route path="/buildings/:buildingId" element={<BuildingDetailPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/users" element={<UserManagementPage />} />
          <Route path="/admin/templates" element={<DashboardTemplatesPage />} />
          <Route path="/admin/vtags" element={<VtagManagementPage />} />
          <Route path="/admin/vtags/new" element={<VtagConfiguratorPage />} />
          <Route path="/admin/vtags/:id" element={<VtagConfiguratorPage />} />
          <Route path="/admin/widget-configurator" element={<WidgetConfiguratorPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </>
  )
);

export default router;
