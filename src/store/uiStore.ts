import { create } from 'zustand'

interface UiState {
  // Painel de blocos
  blocksPanelOpen: boolean
  toggleBlocksPanel: () => void
  openBlocksPanel: () => void
  closeBlocksPanel: () => void
  // Sidebar (drawer no mobile)
  mobileSidebarOpen: boolean
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
}

export const useUiStore = create<UiState>((set) => ({
  blocksPanelOpen: true,
  toggleBlocksPanel: () => set((s) => ({ blocksPanelOpen: !s.blocksPanelOpen })),
  openBlocksPanel: () => set({ blocksPanelOpen: true }),
  closeBlocksPanel: () => set({ blocksPanelOpen: false }),

  mobileSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  openSidebar: () => set({ mobileSidebarOpen: true }),
  closeSidebar: () => set({ mobileSidebarOpen: false }),
}))