import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/home', label: 'Home', end: true },
  { to: '/favorites', label: 'Favorites' },
  { to: '/playlists', label: 'My Playlists' },
  { to: '/driver-mode', label: 'Driver Mode' },
]

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <NavLink to="/home" className="text-lg font-semibold tracking-tight">
            Raasta FM
          </NavLink>
          <nav className="flex gap-4 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `text-neutral-400 transition-colors hover:text-neutral-100 ${
                    isActive ? 'text-amber-400' : ''
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
