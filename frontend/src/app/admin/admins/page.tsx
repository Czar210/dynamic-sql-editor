"use client"
import { useState, useEffect } from "react"
import { Shield, Plus, Trash2, User } from "lucide-react"
import { useAuth } from "@/components/AuthContext"

export default function AdminsPage() {
  const { token, isMaster } = useAuth()
  const [admins, setAdmins] = useState<any[]>([])
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [error, setError] = useState("")

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  useEffect(() => {
    if (!isMaster) return
    fetch(`${API}/api/admins`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setAdmins).catch(console.error)
  }, [API, token, isMaster])

  const createAdmin = async () => {
    if (!username || !password) return setError("Preencha ambos os campos")
    setError(""); setMsg("")
    const res = await fetch(`${API}/api/admins`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ username, password, role: "admin" })
    })
    if (res.ok) {
      const newAdmin = await res.json()
      setAdmins(prev => [...prev, newAdmin])
      setUsername(""); setPassword("")
      setMsg("Admin criado com sucesso!")
    } else {
      const err = await res.json()
      setError(err.detail || "Erro ao criar admin")
    }
  }

  const deleteAdmin = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este admin?")) return
    const res = await fetch(`${API}/api/admins/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` }
    })
    if (res.ok) setAdmins(prev => prev.filter(a => a.id !== id))
  }

  if (!isMaster) return <div className="p-8 text-center" style={{ color: 'hsl(var(--color-text-muted))' }}>Acesso restrito ao Master.</div>

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'hsl(var(--color-text))' }}>
          <Shield className="w-8 h-8" style={{ color: 'hsl(var(--color-primary))' }} />
          Gerenciar Administradores
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'hsl(var(--color-text-muted))' }}>
          Crie contas de administrador. Cada admin pode criar seus próprios moderadores e grupos de banco.
        </p>
      </div>

      {/* Create Admin Form */}
      <div className="rounded-2xl p-6 space-y-4" style={{ background: 'hsl(var(--color-bg-card))', border: '1px solid hsl(var(--color-border))' }}>
        <h2 className="text-lg font-semibold" style={{ color: 'hsl(var(--color-text))' }}>Novo Administrador</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text" placeholder="Username" value={username}
            onChange={(e: any) => setUsername(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none"
            style={{ background: 'hsl(var(--color-bg-surface))', border: '1px solid hsl(var(--color-border))', color: 'hsl(var(--color-text))' }}
          />
          <input
            type="password" placeholder="Senha" value={password}
            onChange={(e: any) => setPassword(e.target.value)}
            className="w-full rounded-lg px-4 py-2.5 text-sm focus:outline-none"
            style={{ background: 'hsl(var(--color-bg-surface))', border: '1px solid hsl(var(--color-border))', color: 'hsl(var(--color-text))' }}
          />
        </div>
        <button onClick={createAdmin} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ background: 'hsl(var(--color-primary))' }}>
          <Plus className="w-4 h-4" /> Criar Admin
        </button>
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {/* Admins List */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'hsl(var(--color-bg-card))', border: '1px solid hsl(var(--color-border))' }}>
        <div className="p-4 font-semibold text-sm" style={{ background: 'hsl(var(--color-bg-surface))', color: 'hsl(var(--color-text-muted))' }}>
          ADMINS REGISTRADOS
        </div>
        {admins.length === 0 ? (
          <div className="p-8 text-center text-sm" style={{ color: 'hsl(var(--color-text-muted))' }}>Nenhum admin criado ainda.</div>
        ) : (
          admins.map((admin: any) => (
            <div key={admin.id} className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid hsl(var(--color-border))' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ background: 'hsl(var(--color-primary))' }}>
                  {admin.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'hsl(var(--color-text))' }}>{admin.username}</p>
                  <p className="text-xs" style={{ color: 'hsl(var(--color-text-muted))' }}>ID: {admin.id}</p>
                </div>
              </div>
              <button onClick={() => deleteAdmin(admin.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
