import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'

// Shell autenticado: sidebar fixa + área central (Outlet).
export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
