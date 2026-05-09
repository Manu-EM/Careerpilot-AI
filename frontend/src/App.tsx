import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import ResumeStudio from './pages/ResumeStudio'
import ApplyQueue from './pages/ApplyQueue'
import Tracker from './pages/Tracker'
import Analytics from './pages/Analytics'
import Onboarding from './pages/Onboarding'
import Login from './pages/Login'
import Register from './pages/Register'
import Landing from './pages/Landing'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import { useAuthStore } from './store/authStore'

// Redirects to /login if not authenticated
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore()
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

// Redirects logged-in users away from login/register pages
function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuthStore()
  if (isLoggedIn) return <Navigate to="/app/dashboard" replace />
  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login"    element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
        <Route path="/onboarding" element={
          <PrivateRoute><Onboarding /></PrivateRoute>
        } />

        {/* Protected app routes */}
        <Route path="/app" element={
          <PrivateRoute><MainLayout /></PrivateRoute>
        }>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs"      element={<Jobs />} />
          <Route path="resume"    element={<ResumeStudio />} />
          <Route path="apply"     element={<ApplyQueue />} />
          <Route path="tracker"   element={<Tracker />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile"   element={<Profile />} />
          <Route path="settings"  element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App