import { create } from 'zustand'
import type { ViewKey, RoleKey } from './data'

export interface AuthUser {
  id: string
  nama: string
  nip: string
  email: string
  role: string
  roleLabel: string
  roleId: string
  token: string
}

interface AppState {
  // Auth
  isAuthenticated: boolean
  currentUser: AuthUser | null
  loginError: string

  // Navigation
  view: ViewKey

  // Sidebar
  sidebarCollapsed: boolean

  // Actions
  setView: (v: ViewKey) => void
  login: (user: AuthUser) => void
  logout: () => void
  setLoginError: (msg: string) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  currentUser: null,
  loginError: '',
  view: 'landing' as ViewKey,
  sidebarCollapsed: false,

  setView: (v) => set({ view: v }),

  login: (user) => set({
    isAuthenticated: true,
    currentUser: user,
    loginError: '',
  }),

  logout: () => set({
    isAuthenticated: false,
    currentUser: null,
    view: 'landing' as ViewKey,
  }),

  setLoginError: (msg) => set({ loginError: msg }),

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
}))
