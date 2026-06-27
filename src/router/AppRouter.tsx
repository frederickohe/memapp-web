import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { isAdminHost } from '../config/hosts'
import { AdminLayout } from '../apps/admin/AdminLayout'
import { DashboardPage } from '../apps/admin/pages/DashboardPage'
import { PlaceholderPage } from '../apps/admin/pages/PlaceholderPage'
import { WebsiteLayout } from '../apps/website/WebsiteLayout'
import { HomePage } from '../apps/website/pages/HomePage'

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route
          path="members"
          element={
            <PlaceholderPage
              title="Members"
              description="Member management screens will live here."
            />
          }
        />
        <Route
          path="programs"
          element={
            <PlaceholderPage
              title="Programs"
              description="Program creation and enrollment tools will live here."
            />
          }
        />
        <Route
          path="forms"
          element={
            <PlaceholderPage
              title="Forms"
              description="Form builder and response review will live here."
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
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

function LocalAdminRoutes() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route
          path="members"
          element={
            <PlaceholderPage
              title="Members"
              description="Member management screens will live here."
            />
          }
        />
        <Route
          path="programs"
          element={
            <PlaceholderPage
              title="Programs"
              description="Program creation and enrollment tools will live here."
            />
          }
        />
        <Route
          path="forms"
          element={
            <PlaceholderPage
              title="Forms"
              description="Form builder and response review will live here."
            />
          }
        />
      </Route>
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

  return (
    <BrowserRouter>
      {useLocalPaths ? (
        <LocalAdminRoutes />
      ) : isAdminHost() ? (
        <AdminRoutes />
      ) : (
        <WebsiteRoutes />
      )}
    </BrowserRouter>
  )
}
