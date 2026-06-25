import { create } from 'zustand'

interface UiState {
  blocksPanelOpen: boolean
  toggleBlocksPanel: () => void
  openBlocksPanel: () => void
  closeBlocksPanel: () => void
}

// Estado de UI compartilhado. Começa ABERTO para o usuário descobrir o
// menu de blocos assim que entra num relatório.
export const useUiStore = create<UiState>((set) => ({
  blocksPanelOpen: true,
  toggleBlocksPanel: () => set((s) => ({ blocksPanelOpen: !s.blocksPanelOpen })),
  openBlocksPanel: () => set({ blocksPanelOpen: true }),
  closeBlocksPanel: () => set({ blocksPanelOpen: false }),
}))