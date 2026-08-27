import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { isAdminHost, isYlearnHost } from '../config/hosts'
import { AdminApp } from '../apps/admin/AdminApp'
import { AdminLayout } from '../apps/admin/AdminLayout'
import { RequireAuth, RequireGuest } from '../apps/admin/guards'
import { LoginPage } from '../apps/admin/pages/auth/LoginPage'
import { ChangePasswordPage } from '../apps/admin/pages/auth/ChangePasswordPage'
import { DashboardPage } from '../apps/admin/pages/dashboard/DashboardPage'
import { AnalyticsPage } from '../apps/admin/pages/analytics/AnalyticsPage'
import { FinancePage } from '../apps/admin/pages/finance/FinancePage'
import { VhsPage } from '../apps/admin/pages/vhs/VhsPage'
import { FormsPage } from '../apps/admin/pages/forms/FormsPage'
import { ProgramsPage } from '../apps/admin/pages/programs/ProgramsPage'
import { NewsPage } from '../apps/admin/pages/news/NewsPage'
import { ProfilesPage } from '../apps/admin/pages/profiles/ProfilesPage'
import { UsersPage } from '../apps/admin/pages/users/UsersPage'
import { MessagesPage } from '../apps/admin/pages/messages/MessagesPage'
import { BranchesPage } from '../apps/admin/pages/branches/BranchesPage'
import { UserRolesPage } from '../apps/admin/pages/user-roles/UserRolesPage'
import { SettingsPage } from '../apps/admin/pages/settings/SettingsPage'
import { WebsiteLayout } from '../apps/website/WebsiteLayout'
import { HomePage } from '../apps/website/pages/HomePage'
import { YlearnApp } from '../apps/ylearn/YlearnApp'

function LocalRoutes() {
  return (
    <Routes>
      <Route element={<WebsiteLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      <Route path="/admin/*" element={<AdminApp />}>
        <Route element={<RequireGuest />}>
          <Route path="login" element={<LoginPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="vhs" element={<VhsPage />} />
            <Route path="forms" element={<FormsPage />} />
            <Route path="programs" element={<ProgramsPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="profiles" element={<ProfilesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="user-roles" element={<UserRolesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/ylearn/*" element={<YlearnApp />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function ProductionAdminRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<AdminApp />}>
        <Route element={<RequireGuest />}>
          <Route path="login" element={<LoginPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="vhs" element={<VhsPage />} />
            <Route path="forms" element={<FormsPage />} />
            <Route path="programs" element={<ProgramsPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route path="profiles" element={<ProfilesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="branches" element={<BranchesPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="user-roles" element={<UserRolesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

function ProductionYlearnRoutes() {
  return (
    <Routes>
      <Route path="/*" element={<YlearnApp />} />
    </Routes>
  )
}

function WebsiteRoutes() {
  return (
    <Routes>
      <Route element={<WebsiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export function AppRouter() {
  const hostname = window.location.hostname
  const useLocalPaths = hostname === 'localhost' || hostname === '127.0.0.1'
  const onAdminHost = isAdminHost()
  const onYlearnHost = isYlearnHost()

  return (
    <BrowserRouter>
      {useLocalPaths ? (
        <LocalRoutes />
      ) : onAdminHost ? (
        <ProductionAdminRoutes />
      ) : onYlearnHost ? (
        <ProductionYlearnRoutes />
      ) : (
        <WebsiteRoutes />
      )}
    </BrowserRouter>
  )
}
