import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Bell, BookOpen, CircleHelp, LayoutDashboard, LogOut, Menu, Search, Settings, ShieldCheck, Target, TrendingUp, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const studentNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/review', label: 'Review', icon: BookOpen },
  { to: '/practice', label: 'Practice', icon: Target },
  { to: '/mistakes', label: 'Mistakes', icon: ShieldCheck },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
]
const adminNav = [{ to: '/admin', label: 'Student progress', icon: LayoutDashboard }]

export function AppLayout() {
  const [open, setOpen] = useState(false)
  const [logoutError, setLogoutError] = useState('')
  const navigate = useNavigate()
  const { profile, signOut } = useAuth()
  const nav = profile?.role === 'admin' ? adminNav : studentNav
  const name = profile?.full_name || profile?.email || 'Student'
  const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  async function logout() {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch {
      setLogoutError('Could not log out. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#F6F7F6] text-[#151817]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-[#E2E7E4] bg-white p-5 transition-transform md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-2"><div className="grid h-9 w-9 place-items-center rounded-xl bg-[#146C4B] font-bold text-white">CR</div><span className="font-bold">College Reviewer</span></div>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <nav className="space-y-1">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${isActive ? 'bg-[#E8F3ED] text-[#146C4B]' : 'text-[#737A76] hover:bg-[#F0F4F1]'}`}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto space-y-1 border-t border-[#E2E7E4] pt-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#737A76] hover:bg-[#F0F4F1]"><Settings size={18} />Settings</button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#737A76] hover:bg-[#F0F4F1]"><CircleHelp size={18} />Help center</button>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#737A76] hover:bg-[#F0F4F1]"><LogOut size={18} />Log out</button>
          {logoutError && <p role="alert" className="text-xs text-[#C94B4B]">{logoutError}</p>}
        </div>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-[#E2E7E4] bg-[#F6F7F6] px-5 md:px-10">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 hover:bg-white md:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
            <div className="hidden items-center gap-2 rounded-xl border border-[#E2E7E4] bg-white px-3 py-2 text-sm text-[#737A76] sm:flex"><Search size={17} /><input className="w-44 bg-transparent outline-none" placeholder="Search topics" aria-label="Search topics" /></div>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative rounded-lg p-2 text-[#737A76] hover:bg-white" aria-label="Notifications"><Bell size={19} /></button>
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-[#DCEBE2] text-sm font-bold text-[#146C4B]">{initials}</div>
              <div className="hidden text-left sm:block"><div className="text-sm font-semibold">{name}</div><div className="text-xs text-[#737A76]">{profile?.email}</div></div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-5 md:p-10"><Outlet /></main>
      </div>
    </div>
  )
}
