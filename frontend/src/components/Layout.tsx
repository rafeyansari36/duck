import { Toaster } from 'react-hot-toast'
import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'nav-pill nav-pill-active' : 'nav-pill'

  return (
    <main className="shell">
      <nav className="top-nav">
        <NavLink to="/" end className={navClass}>
          Home
        </NavLink>
        <NavLink to="/entries" className={navClass}>
          Entries
        </NavLink>
      </nav>
      <Outlet />
      <Toaster position="bottom-right" toastOptions={{ duration: 3500 }} />
    </main>
  )
}
