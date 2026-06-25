import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { createEmptyReport } from '@/types/blocks'
import type { Block, Report } from '@/types/blocks'

// Item leve para a lista da sidebar
export interface ReportListItem {
  id: string
  title: string
  clientName: string | null
  groupId: string | null
  updatedAt: string
  createdAt: string
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

// ---- mapeadores (snake_case do banco -> camelCase do app) ----
function mapListItem(r: Record<string, unknown>): ReportListItem {
  return {
    id: r.id as string,
    title: (r.title as string) ?? 'Sem título',
    clientName: (r.client_name as string | null) ?? null,
    groupId: (r.group_id as string | null) ?? null,
    updatedAt: r.updated_at as string,
    createdAt: r.created_at as string,
  }
}

function mapReport(r: Record<string, unknown>): Report {
  return {
    id: r.id as string,
    ownerId: r.owner_id as string,
    groupId: (r.group_id as string | null) ?? null,
    title: (r.title as string) ?? 'Sem título',
    clientName: (r.client_name as string | null) ?? null,
    blocks: ((r.blocks as Block[]) ?? []),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  }
}

const LIST_COLS = 'id, title, client_name, group_id, updated_at, created_at'

interface ReportsState {
  list: ReportListItem[]
  listLoading: boolean
  current: Report | null
  currentLoading: boolean
  saveStatus: SaveStatus
  lastSavedAt: string | null

  fetchList: () => Promise<void>
  createReport: () => Promise<string | null>
  openReport: (id: string) => Promise<void>
  clearCurrent: () => void
  setCurrentTitle: (title: string) => void
  setCurrentBlocks: (blocks: Block[]) => void
  saveCurrent: () => Promise<void>
  deleteReport: (id: string) => Promise<void>
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  list: [],
  listLoading: false,
  current: null,
  currentLoading: false,
  saveStatus: 'idle',
  lastSavedAt: null,

  fetchList: async () => {
    set({ listLoading: true })
    const { data, error } = await supabase
      .from('reports')
      .select(LIST_COLS)
      .order('updated_at', { ascending: false })
    if (error) {
      console.error('[reports] fetchList:', error.message)
      set({ listLoading: false })
      return
    }
    set({ list: (data ?? []).map(mapListItem), listLoading: false })
  },

  createReport: async () => {
    const user = useAuthStore.getState().user
    if (!user) return null
    const seed = createEmptyReport(user.id)
    const { data, error } = await supabase
      .from('reports')
      .insert({
        owner_id: seed.ownerId,
        group_id: seed.groupId,
        title: seed.title,
        client_name: seed.clientName,
        blocks: seed.blocks,
      })
      .select(LIST_COLS)
      .single()
    if (error || !data) {
      console.error('[reports] createReport:', error?.message)
      return null
    }
    const item = mapListItem(data)
    set({ list: [item, ...get().list] })
    return item.id
  },

  openReport: async (id) => {
    set({ currentLoading: true, saveStatus: 'idle' })
    const { data, error } = await supabase.from('reports').select('*').eq('id', id).single()
    if (error || !data) {
      console.error('[reports] openReport:', error?.message)
      set({ current: null, currentLoading: false })
      return
    }
    set({ current: mapReport(data), currentLoading: false })
  },

  clearCurrent: () => set({ current: null, saveStatus: 'idle' }),

  setCurrentTitle: (title) => {
    const cur = get().current
    if (!cur) return
    set({ current: { ...cur, title } })
  },

  setCurrentBlocks: (blocks) => {
    const cur = get().current
    if (!cur) return
    set({ current: { ...cur, blocks } })
  },

  saveCurrent: async () => {
    const cur = get().current
    if (!cur) return
    set({ saveStatus: 'saving' })
    const { error } = await supabase
      .from('reports')
      .update({ title: cur.title, client_name: cur.clientName, blocks: cur.blocks })
      .eq('id', cur.id)
    if (error) {
      console.error('[reports] saveCurrent:', error.message)
      set({ saveStatus: 'error' })
      return
    }
    const now = new Date().toISOString()
    // reflete a alteração na lista da sidebar e reordena por mais recente
    const list = get().list
      .map((it) => (it.id === cur.id ? { ...it, title: cur.title, updatedAt: now } : it))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    set({ saveStatus: 'saved', lastSavedAt: now, list })
  },

  deleteReport: async (id) => {
    const { error } = await supabase.from('reports').delete().eq('id', id)
    if (error) {
      console.error('[reports] deleteReport:', error.message)
      return
    }
    const wasCurrent = get().current?.id === id
    set({
      list: get().list.filter((it) => it.id !== id),
      current: wasCurrent ? null : get().current,
    })
  },
}))
