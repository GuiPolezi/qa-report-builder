import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Profile, UserRole } from '@/store/authStore'

export interface AdminGroup {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Membership {
  group_id: string
  user_id: string
}

export interface AdminReportRow {
  id: string
  ownerId: string
  ownerName: string
  title: string
  groupId: string | null
  updatedAt: string
}

interface AdminState {
  users: Profile[]
  groups: AdminGroup[]
  memberships: Membership[]
  reports: AdminReportRow[]
  loading: boolean

  fetchAll: () => Promise<void>
  fetchReports: () => Promise<void>
  setUserRole: (id: string, role: UserRole) => Promise<void>
  createGroup: (name: string, description: string) => Promise<void>
  updateGroup: (id: string, patch: Partial<Pick<AdminGroup, 'name' | 'description'>>) => Promise<void>
  deleteGroup: (id: string) => Promise<void>
  addMember: (groupId: string, userId: string) => Promise<void>
  removeMember: (groupId: string, userId: string) => Promise<void>
  setReportGroup: (id: string, groupId: string | null) => Promise<void>
  deleteReport: (id: string) => Promise<void>
}

export const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  groups: [],
  memberships: [],
  reports: [],
  loading: false,

  fetchAll: async () => {
    set({ loading: true })
    const [u, g, m] = await Promise.all([
      supabase.from('profiles').select('id, full_name, email, role, created_at').order('created_at'),
      supabase.from('groups').select('id, name, description, created_at').order('name'),
      supabase.from('group_members').select('group_id, user_id'),
    ])
    if (u.error) console.error('[admin] users:', u.error.message)
    if (g.error) console.error('[admin] groups:', g.error.message)
    if (m.error) console.error('[admin] memberships:', m.error.message)
    set({
      users: (u.data ?? []) as Profile[],
      groups: (g.data ?? []) as AdminGroup[],
      memberships: (m.data ?? []) as Membership[],
      loading: false,
    })
  },

  fetchReports: async () => {
    const { data, error } = await supabase
      .from('reports')
      .select('id, owner_id, title, group_id, updated_at')
      .order('updated_at', { ascending: false })
    if (error) {
      console.error('[admin] reports:', error.message)
      return
    }
    const users = get().users
    const rows: AdminReportRow[] = (data ?? []).map((r: Record<string, unknown>) => {
      const ownerId = r.owner_id as string
      const owner = users.find((u) => u.id === ownerId)
      return {
        id: r.id as string,
        ownerId,
        ownerName: owner?.full_name ?? owner?.email ?? '—',
        title: (r.title as string) ?? 'Sem título',
        groupId: (r.group_id as string | null) ?? null,
        updatedAt: r.updated_at as string,
      }
    })
    set({ reports: rows })
  },

  setUserRole: async (id, role) => {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
    if (error) {
      console.error('[admin] setUserRole:', error.message)
      return
    }
    set({ users: get().users.map((u) => (u.id === id ? { ...u, role } : u)) })
  },

  createGroup: async (name, description) => {
    const createdBy = useAuthStore.getState().user?.id
    const { data, error } = await supabase
      .from('groups')
      .insert({ name, description: description || null, created_by: createdBy })
      .select('id, name, description, created_at')
      .single()
    if (error || !data) {
      console.error('[admin] createGroup:', error?.message)
      return
    }
    set({ groups: [...get().groups, data as AdminGroup].sort((a, b) => a.name.localeCompare(b.name)) })
  },

  updateGroup: async (id, patch) => {
    const { error } = await supabase.from('groups').update(patch).eq('id', id)
    if (error) {
      console.error('[admin] updateGroup:', error.message)
      return
    }
    set({ groups: get().groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) })
  },

  deleteGroup: async (id) => {
    const { error } = await supabase.from('groups').delete().eq('id', id)
    if (error) {
      console.error('[admin] deleteGroup:', error.message)
      return
    }
    set({
      groups: get().groups.filter((g) => g.id !== id),
      memberships: get().memberships.filter((m) => m.group_id !== id),
    })
  },

  addMember: async (groupId, userId) => {
    const { error } = await supabase.from('group_members').insert({ group_id: groupId, user_id: userId })
    if (error) {
      console.error('[admin] addMember:', error.message)
      return
    }
    set({ memberships: [...get().memberships, { group_id: groupId, user_id: userId }] })
  },

  removeMember: async (groupId, userId) => {
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId)
    if (error) {
      console.error('[admin] removeMember:', error.message)
      return
    }
    set({
      memberships: get().memberships.filter((m) => !(m.group_id === groupId && m.user_id === userId)),
    })
  },

  setReportGroup: async (id, groupId) => {
    const { error } = await supabase.from('reports').update({ group_id: groupId }).eq('id', id)
    if (error) {
      console.error('[admin] setReportGroup:', error.message)
      return
    }
    set({ reports: get().reports.map((r) => (r.id === id ? { ...r, groupId } : r)) })
  },

  deleteReport: async (id) => {
    const { error } = await supabase.from('reports').delete().eq('id', id)
    if (error) {
      console.error('[admin] deleteReport:', error.message)
      return
    }
    set({ reports: get().reports.filter((r) => r.id !== id) })
  },
}))
