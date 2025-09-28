import { type User } from '@supabase/supabase-js'

interface AuthState {
  user: Ref<User | null>
  initializing: Ref<boolean>
  ready: Ref<boolean>
  roles: Ref<string[]>
  error: Ref<string | null>
  isAuthenticated: ComputedRef<boolean>
  setUser: (u: User | null) => void
  setRoles: (r: string[]) => void
  setError: (e: string | null) => void
  markReady: () => void
  reset: () => void
}

let _store: AuthState | null = null

export function useAuthStore(): AuthState {
  if (_store) return _store

  const user = ref<User | null>(null)
  const initializing = ref(true)
  const ready = ref(false)
  const roles = ref<string[]>([])
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!user.value)

  function setUser(u: User | null) {
    user.value = u
    if (initializing.value) initializing.value = false
  }
  function setRoles(r: string[]) { roles.value = r }
  function setError(e: string | null) { error.value = e }
  function markReady() { ready.value = true; initializing.value = false }
  function reset() {
    user.value = null
    roles.value = []
    error.value = null
    initializing.value = false
    ready.value = true
  }

  _store = { user, initializing, ready, roles, error, isAuthenticated, setUser, setRoles, setError, markReady, reset }
  return _store
}
