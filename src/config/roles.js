// Single source of truth for "where does this account go after login". Keeps
// every redirect (login, set-password, 404, root) in sync as roles grow.
export function homePathForRole(user) {
  const role = user?.role
  if (role === 'admin') return '/admin'
  if (role === 'owner') return '/owner'
  if (role === 'tenant') return '/tenant'
  return '/login'
}
