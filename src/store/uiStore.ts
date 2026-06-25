import { create } from 'zustand'

interface UiState {
  blocksPanelOpen: boolean
  toggleBlocksPanel: () => void
  openBlocksPanel: () => void
  closeBlocksPanel: () => void
}

// Estado de UI compartilhado (o painel de blocos pode ser aberto pela
// sidebar ou pelo atalho "/" no editor).
export const useUiStore = create<UiState>((set) => ({
  blocksPanelOpen: false,
  toggleBlocksPanel: () => set((s) => ({ blocksPanelOpen: !s.blocksPanelOpen })),
  openBlocksPanel: () => set({ blocksPanelOpen: true }),
  closeBlocksPanel: () => set({ blocksPanelOpen: false }),
}))