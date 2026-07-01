import { Navigate, Route, Routes } from 'react-router-dom'
import {
  RequireYlearnAdmin,
  RequireYlearnAuth,
  RequireYlearnGuest,
  RequireYlearnLearner,
  YlearnPublicLayout,
} from './guards'
import { HomePage as YlearnHomePage } from './pages/HomePage'
import { LoginPage as YlearnLoginPage } from './pages/LoginPage'
import { RegisterPage as YlearnRegisterPage } from './pages/RegisterPage'
import { CoursesPage } from './pages/CoursesPage'
import { CourseDetailPage } from './pages/CourseDetailPage'
import { MapPage } from './pages/MapPage'
import { DashboardPage as YlearnDashboardPage } from './pages/DashboardPage'
import { EnrolmentsPage } from './pages/EnrolmentsPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { ContentPage } from './pages/ContentPage'
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage'
import { AdminUsersPage } from './pages/admin/AdminUsersPage'
import { AdminProvidersPage } from './pages/admin/AdminProvidersPage'
import { AdminCoursesPage } from './pages/admin/AdminCoursesPage'
import { AdminNewCoursePage } from './pages/admin/AdminNewCoursePage'
import { AdminEditCoursePage } from './pages/admin/AdminEditCoursePage'
import { AdminCourseEnrolmentsPage } from './pages/admin/AdminCourseEnrolmentsPage'

export function YlearnRoutes() {
  return (
    <Routes>
      <Route element={<YlearnPublicLayout />}>
        <Route index element={<YlearnHomePage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="courses/:id" element={<CourseDetailPage />} />
        <Route path="map" element={<MapPage />} />
      </Route>

      <Route element={<RequireYlearnGuest />}>
        <Route element={<YlearnPublicLayout />}>
          <Route path="login" element={<YlearnLoginPage />} />
          <Route path="register" element={<YlearnRegisterPage />} />
        </Route>
      </Route>

      <Route element={<RequireYlearnAuth />}>
        <Route element={<RequireYlearnLearner />}>
          <Route path="dashboard" element={<YlearnDashboardPage />} />
          <Route path="enrolments" element={<EnrolmentsPage />} />
          <Route path="checkout/:id" element={<CheckoutPage />} />
          <Route path="content/:courseId" element={<ContentPage />} />
        </Route>

        <Route element={<RequireYlearnAdmin />}>
          <Route path="admin" element={<AdminDashboardPage />} />
          <Route path="admin/users" element={<AdminUsersPage />} />
          <Route path="admin/providers" element={<AdminProvidersPage />} />
          <Route path="admin/courses" element={<AdminCoursesPage />} />
          <Route path="admin/courses/new" element={<AdminNewCoursePage />} />
          <Route path="admin/courses/:id/edit" element={<AdminEditCoursePage />} />
          <Route path="admin/courses/:id/enrolments" element={<AdminCourseEnrolmentsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="" replace />} />
    </Routes>
  )
}
