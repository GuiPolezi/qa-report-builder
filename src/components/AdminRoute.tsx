import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import Spinner from '@/components/Spinner'

// Exige papel admin; espera o profile carregar antes de decidir.
export default function AdminRoute() {
  const profile = useAuthStore((s) => s.profile)
  const profileLoading = useAuthStore((s) => s.profileLoading)

  if (profileLoading || (!profile && useAuthStore.getState().session)) {
    return <Spinner />
  }
  if (profile?.role !== 'admin') return <Navigate to="/" replace />
  return <Outlet />
}
