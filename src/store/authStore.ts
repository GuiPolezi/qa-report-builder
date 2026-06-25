import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type UserRole = 'admin' | 'member'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  role: UserRole
  created_at: string
}

interface SignUpParams {
  fullName: string
  email: string
  password: string
}

interface AuthState {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean         // resolvendo a sessão inicial
  profileLoading: boolean  // buscando o profile após login
  init: () => () => void
  refreshProfile: () => Promise<void>
  signUp: (p: SignUpParams) => Promise<{ error?: string; needsConfirmation?: boolean }>
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,
  loading: true,
  profileLoading: false,

  init: () => {
    // 1) Sessão inicial
    void supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session
      set({ session, user: session?.user ?? null })
      if (session?.user) {
        set({ profileLoading: true })
        await get().refreshProfile()
      }
      set({ loading: false })
    })

    // 2) Mudanças de auth (login/logout/refresh)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
      if (session?.user) {
        set({ profileLoading: true })
        // Adiar a chamada evita o "deadlock" do onAuthStateChange no supabase-js
        setTimeout(() => void get().refreshProfile(), 0)
      } else {
        set({ profile: null, profileLoading: false })
      }
    })

    return () => sub.subscription.unsubscribe()
  },

  refreshProfile: async () => {
    const user = get().user
    if (!user) {
      set({ profile: null, profileLoading: false })
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, created_at')
      .eq('id', user.id)
      .single()
    if (error) {
      console.error('[auth] erro ao carregar profile:', error.message)
      set({ profileLoading: false })
      return
    }
    set({ profile: data as Profile, profileLoading: false })
  },

  signUp: async ({ fullName, email, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) return { error: error.message }
    // Se a confirmação por e-mail estiver ligada, não há sessão ainda.
    const needsConfirmation = !data.session
    return { needsConfirmation }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    return {}
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null, profile: null })
  },
}))

// Seletores utilitários
export const useIsAdmin = () => useAuthStore((s) => s.profile?.role === 'admin')
