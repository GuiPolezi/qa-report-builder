import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import { useUiStore } from '@/store/uiStore'

// Shell autenticado: sidebar (drawer no mobile) + área central.
export default function AppLayout() {
  const sidebarOpen = useUiStore((s) => s.mobileSidebarOpen)
  const openSidebar = useUiStore((s) => s.openSidebar)
  const closeSidebar = useUiStore((s) => s.closeSidebar)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Fundo escuro ao abrir o drawer (mobile) */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
          aria-hidden="true"
        />
      )}

      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Barra superior só no mobile, com o hambúrguer */}
        <div className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <button
            onClick={openSidebar}
            aria-label="Abrir menu"
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-slate-900">QA Report Builder</span>
        </div>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}