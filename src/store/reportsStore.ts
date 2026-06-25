import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { createEmptyReport, createBlock } from '@/types/blocks'
import type { Block, BlockType, Report } from '@/types/blocks'

// Item leve para a lista da sidebar
export interface ReportListItem {
  id: string
  ownerId: string
  title: string
  clientName: string | null
  groupId: string | null
  updatedAt: string
  createdAt: string
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface AssignableGroup {
  id: string
  name: string
}

// ---- mapeadores (snake_case do banco -> camelCase do app) ----
function mapListItem(r: Record<string, unknown>): ReportListItem {
  return {
    id: r.id as string,
    ownerId: r.owner_id as string,
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

const LIST_COLS = 'id, owner_id, title, client_name, group_id, updated_at, created_at'

interface ReportsState {
  list: ReportListItem[]
  listLoading: boolean
  current: Report | null
  currentLoading: boolean
  saveStatus: SaveStatus
  lastSavedAt: string | null
  dirty: boolean
  assignableGroups: AssignableGroup[]

  fetchList: () => Promise<void>
  fetchAssignableGroups: () => Promise<void>
  setCurrentGroup: (groupId: string | null) => void
  createReport: () => Promise<string | null>
  openReport: (id: string) => Promise<void>
  clearCurrent: () => void
  setCurrentTitle: (title: string) => void
  setCurrentBlocks: (blocks: Block[]) => void
  saveCurrent: () => Promise<void>
  deleteReport: (id: string) => Promise<void>

  // operações de bloco
  updateBlock: (id: string, patch: Partial<Block>) => void
  moveBlock: (id: string, dir: 'up' | 'down') => void
  duplicateBlock: (id: string) => void
  deleteBlock: (id: string) => void
  insertBlock: (type: BlockType, afterId?: string) => void
  reorderBlocks: (activeId: string, overId: string) => void
}

const newId = () =>
  globalThis.crypto?.randomUUID?.() ??
  'b_' + Math.random().toString(36).slice(2) + Date.now().toString(36)

export const useReportsStore = create<ReportsState>((set, get) => ({
  list: [],
  listLoading: false,
  current: null,
  currentLoading: false,
  saveStatus: 'idle',
  lastSavedAt: null,
  dirty: false,
  assignableGroups: [],

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

  fetchAssignableGroups: async () => {
    // RLS retorna só os grupos que o usuário pode ver (membro ou admin)
    const { data, error } = await supabase.from('groups').select('id, name').order('name')
    if (error) {
      console.error('[reports] fetchAssignableGroups:', error.message)
      return
    }
    set({ assignableGroups: (data ?? []) as AssignableGroup[] })
  },

  setCurrentGroup: (groupId) => {
    const cur = get().current
    if (!cur) return
    set({ current: { ...cur, groupId }, dirty: true })
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
    set({ current: mapReport(data), currentLoading: false, dirty: false })
  },

  clearCurrent: () => set({ current: null, saveStatus: 'idle', dirty: false }),

  setCurrentTitle: (title) => {
    const cur = get().current
    if (!cur) return
    set({ current: { ...cur, title }, dirty: true })
  },

  setCurrentBlocks: (blocks) => {
    const cur = get().current
    if (!cur) return
    set({ current: { ...cur, blocks }, dirty: true })
  },

  saveCurrent: async () => {
    const cur = get().current
    if (!cur) return
    set({ saveStatus: 'saving' })
    const { error } = await supabase
      .from('reports')
      .update({ title: cur.title, client_name: cur.clientName, group_id: cur.groupId, blocks: cur.blocks })
      .eq('id', cur.id)
    if (error) {
      console.error('[reports] saveCurrent:', error.message)
      set({ saveStatus: 'error' })
      return
    }
    const now = new Date().toISOString()
    // reflete a alteração na lista da sidebar e reordena por mais recente
    const list = get().list
      .map((it) => (it.id === cur.id ? { ...it, title: cur.title, groupId: cur.groupId, updatedAt: now } : it))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    set({ saveStatus: 'saved', lastSavedAt: now, list, dirty: false })
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

  // ---- operações de bloco (mexem em current.blocks de forma imutável) ----
  updateBlock: (id, patch) => {
    const cur = get().current
    if (!cur) return
    const blocks = cur.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b))
    set({ current: { ...cur, blocks }, dirty: true })
  },

  moveBlock: (id, dir) => {
    const cur = get().current
    if (!cur) return
    const i = cur.blocks.findIndex((b) => b.id === id)
    if (i < 0) return
    const j = dir === 'up' ? i - 1 : i + 1
    if (j < 0 || j >= cur.blocks.length) return
    const blocks = [...cur.blocks]
    ;[blocks[i], blocks[j]] = [blocks[j], blocks[i]]
    set({ current: { ...cur, blocks }, dirty: true })
  },

  duplicateBlock: (id) => {
    const cur = get().current
    if (!cur) return
    const i = cur.blocks.findIndex((b) => b.id === id)
    if (i < 0) return
    const copy = { ...structuredClone(cur.blocks[i]), id: newId() } as Block
    const blocks = [...cur.blocks]
    blocks.splice(i + 1, 0, copy)
    set({ current: { ...cur, blocks }, dirty: true })
  },

  deleteBlock: (id) => {
    const cur = get().current
    if (!cur) return
    set({ current: { ...cur, blocks: cur.blocks.filter((b) => b.id !== id) }, dirty: true })
  },

  insertBlock: (type, afterId) => {
    const cur = get().current
    if (!cur) return
    const block = createBlock(type)
    const blocks = [...cur.blocks]
    if (afterId) {
      const i = blocks.findIndex((b) => b.id === afterId)
      blocks.splice(i + 1, 0, block)
    } else {
      blocks.push(block)
    }
    set({ current: { ...cur, blocks }, dirty: true })
  },

  reorderBlocks: (activeId, overId) => {
    const cur = get().current
    if (!cur || activeId === overId) return
    const from = cur.blocks.findIndex((b) => b.id === activeId)
    const to = cur.blocks.findIndex((b) => b.id === overId)
    if (from < 0 || to < 0) return
    const blocks = [...cur.blocks]
    const [moved] = blocks.splice(from, 1)
    blocks.splice(to, 0, moved)
    set({ current: { ...cur, blocks }, dirty: true })
  },
}))
