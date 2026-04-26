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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* App routes with sidebar layout */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="resume" element={<ResumeStudio />} />
          <Route path="apply" element={<ApplyQueue />} />
          <Route path="tracker" element={<Tracker />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App