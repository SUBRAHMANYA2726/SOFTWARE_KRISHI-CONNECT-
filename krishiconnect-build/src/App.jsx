import { Route, Routes } from 'react-router-dom'
import AppShell from './layouts/AppShell'
import ProtectedRoute from './layouts/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import Mandi from './pages/Mandi'
import ProfitCalculator from './pages/ProfitCalculator'
import FertilizerCalculator from './pages/FertilizerCalculator'
import Reports from './pages/Reports'
import ReportDetail from './pages/ReportDetail'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute requireProfile={false} />}>
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>

      <Route element={<AppShell />}>
        <Route path="/mandi" element={<Mandi />} />
        <Route path="/calculator/profit" element={<ProfitCalculator />} />
        <Route path="/calculator/fertilizer" element={<FertilizerCalculator />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/reports/:reportId" element={<ReportDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
