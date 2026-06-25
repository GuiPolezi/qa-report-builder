import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import ProtectedRoute from '@/components/ProtectedRoute'
import AdminRoute from '@/components/AdminRoute'
import AppLayout from '@/components/AppLayout'
import Spinner from '@/components/Spinner'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import EmptyState from '@/pages/EmptyState'
import ReportView from '@/pages/ReportView'
import AdminPage from '@/pages/AdminPage'

export default function App() {
  const init = useAuthStore((s) => s.init)
  const loading = useAuthStore((s) => s.loading)

  useEffect(() => {
    const unsubscribe = init()
    return unsubscribe
  }, [init])

  if (loading) return <Spinner />

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Exige login: shell com sidebar + área central */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<EmptyState />} />
          <Route path="/r/:id" element={<ReportView />} />
        </Route>

        {/* Exige admin */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
