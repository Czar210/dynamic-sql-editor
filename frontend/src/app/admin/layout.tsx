"use client"
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Database, Upload, FileSpreadsheet, Users, LogOut, Palette, Shield, FolderOpen } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAuth } from '@/components/AuthContext'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { useEffect, useState } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isMaster, isAdmin, logout } = useAuth()
  const [showTheme, setShowTheme] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  // Build nav items based on role
  const navItems: { href: string; icon: any; label: string }[] = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  ]

  if (isMaster) {
    navItems.push({ href: '/admin/admins', icon: Shield, label: 'Administradores' })
  }

  if (isAdmin && !isMaster) {
    navItems.push({ href: '/admin/groups', icon: FolderOpen, label: 'Database Groups' })
    navItems.push({ href: '/admin/tables', icon: Database, label: 'Tabelas' })
    navItems.push({ href: '/admin/import/sql', icon: Upload, label: 'Importar SQL' })
    navItems.push({ href: '/admin/import/data', icon: FileSpreadsheet, label: 'Importar CSV/XLSX' })
    navItems.push({ href: '/admin/users', icon: Users, label: 'Moderadores' })
  }

  if (user?.role === 'moderator') {
    navItems.push({ href: '/admin/groups', icon: FolderOpen, label: 'Meus Grupos' })
    navItems.push({ href: '/admin/tables', icon: Database, label: 'Tabelas' })
    navItems.push({ href: '/admin/import/data', icon: FileSpreadsheet, label: 'Importar CSV/XLSX' })
  }

  const roleLabel = user?.role === 'master' ? 'Master' : user?.role === 'admin' ? 'Admin' : 'Moderador'

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(var(--color-bg))', color: 'hsl(var(--color-text))' }}>
      {/* Sidebar */}
      <aside className="w-64 p-4 hidden md:flex flex-col" style={{ background: 'hsl(var(--color-bg-card))', borderRight: '1px solid hsl(var(--color-border))' }}>
        <div className="mb-8 px-4">
          <h1 className="text-xl font-bold" style={{ color: 'hsl(var(--color-primary))' }}>
            Dynamic CMS
          </h1>
          <p className="text-xs mt-1" style={{ color: 'hsl(var(--color-text-muted))' }}>
            {user?.username}
          </p>
          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--color-primary) / 0.15)', color: 'hsl(var(--color-primary))' }}>
            {roleLabel}
          </span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200"
                style={{
                  background: isActive ? 'hsl(var(--color-primary) / 0.12)' : 'transparent',
                  color: isActive ? 'hsl(var(--color-primary))' : 'hsl(var(--color-text-muted))',
                }}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Theme Switcher Toggle */}
        <div className="mt-auto space-y-2">
          <button
            onClick={() => setShowTheme(!showTheme)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm w-full transition-all duration-200"
            style={{ color: 'hsl(var(--color-text-muted))' }}
          >
            <Palette className="w-5 h-5" />
            Personalizar Tema
          </button>
          {showTheme && <ThemeSwitcher />}

          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm w-full transition-all duration-200 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 flex items-center px-6" style={{ borderBottom: '1px solid hsl(var(--color-border))', background: 'hsl(var(--color-bg-card))' }}>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-medium text-white text-sm" style={{ background: 'hsl(var(--color-primary))' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
        
        <div className="flex-1 p-6 lg:p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
