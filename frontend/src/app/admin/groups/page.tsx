"use client"
import { useState, useEffect } from "react"
import { FolderOpen, Plus, Trash2, Users, ChevronDown, ChevronUp } from "lucide-react"
import { useAuth } from "@/components/AuthContext"

type Group = { id: number; name: string; description: string | null; admin_id: number; created_at: string }
type Mod = { id: number; username: string; role: string; parent_id: number | null }
type Perm = { id: number; moderator_id: number; database_group_id: number }

export default function GroupsPage() {
  const { token, user, isAdmin, isMaster } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [mods, setMods] = useState<Mod[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null)
  const [groupPerms, setGroupPerms] = useState<Record<number, Perm[]>>({})
  const [msg, setMsg] = useState("")

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }

  useEffect(() => {
    fetch(`${API}/api/database-groups`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setGroups).catch(console.error)
    
    if (isAdmin) {
      fetch(`${API}/api/moderators`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(setMods).catch(console.error)
    }
  }, [API, token, isAdmin])

  const createGroup = async () => {
    if (!name) return
    setMsg("")
    const res = await fetch(`${API}/api/database-groups`, {
      method: "POST", headers, body: JSON.stringify({ name, description })
    })
    if (res.ok) {
      const g = await res.json()
      setGroups(prev => [...prev, g])
      setName(""); setDescription("")
      setMsg("Grupo criado!")
    }
  }

  const deleteGroup = async (id: number) => {
    if (!confirm("Deletar grupo? Todas as tabelas dentro serão removidas.")) return
    await fetch(`${API}/api/database-groups/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
    setGroups(prev => prev.filter(g => g.id !== id))
  }

  const grantPerm = async (groupId: number, modId: number) => {
    const res = await fetch(`${API}/api/database-groups/${groupId}/permissions`, {
      method: "POST", headers, body: JSON.stringify({ moderator_id: modId })
    })
    if (res.ok) {
      setMsg("Permissão concedida!")
      // Refresh the page state
      const newPerm = await res.json()
      setGroupPerms(prev => ({ ...prev, [groupId]: [...(prev[groupId] || []), newPerm] }))
    }
  }

  const revokePerm = async (groupId: number, modId: number) => {
    await fetch(`${API}/api/database-groups/${groupId}/permissions/${modId}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` }
    })
    setGroupPerms(prev => ({
      ...prev, [groupId]: (prev[groupId] || []).filter(p => p.moderator_id !== modId)
    }))
  }

  const isMod = user?.role === 'moderator'

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3" style={{ color: 'hsl(var(--color-text))' }}>
          <FolderOpen className="w-8 h-8" style={{ color: 'hsl(var(--color-primary))' }} />
          {isMod ? "Meus Grupos" : "Database Groups"}
        </h1>
        <p className="mt-2 text-sm" style={{ color: 'hsl(var(--color-text-muted))' }}>
          {isMod ? "Grupos de banco de dados aos quais você tem acesso." : "Crie grupos lógicos de tabelas e controle quem tem acesso."}
        </p>
      </div>

      {/* Create Form (admin only) */}
      {isAdmin && !isMaster && (
        <div className="rounded-2xl p-6 space-y-4" style={{ background: 'hsl(var(--color-bg-card))', border: '1px solid hsl(var(--color-border))' }}>
          <h2 className="text-lg font-semibold" style={{ color: 'hsl(var(--color-text))' }}>Novo Grupo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Nome do grupo" value={name} onChange={(e: any) => setName(e.target.value)}
              className="rounded-lg px-4 py-2.5 text-sm focus:outline-none"
              style={{ background: 'hsl(var(--color-bg-surface))', border: '1px solid hsl(var(--color-border))', color: 'hsl(var(--color-text))' }} />
            <input type="text" placeholder="Descrição (opcional)" value={description} onChange={(e: any) => setDescription(e.target.value)}
              className="rounded-lg px-4 py-2.5 text-sm focus:outline-none"
              style={{ background: 'hsl(var(--color-bg-surface))', border: '1px solid hsl(var(--color-border))', color: 'hsl(var(--color-text))' }} />
          </div>
          <button onClick={createGroup} className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ background: 'hsl(var(--color-primary))' }}>
            <Plus className="w-4 h-4" /> Criar Grupo
          </button>
          {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        </div>
      )}

      {/* Groups List */}
      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: 'hsl(var(--color-bg-card))', border: '1px solid hsl(var(--color-border))', color: 'hsl(var(--color-text-muted))' }}>
            {isMod ? "Nenhum grupo atribuído a você." : "Crie seu primeiro grupo de banco de dados."}
          </div>
        ) : (
          groups.map(group => (
            <div key={group.id} className="rounded-2xl overflow-hidden" style={{ background: 'hsl(var(--color-bg-card))', border: '1px solid hsl(var(--color-border))' }}>
              <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}>
                <div className="flex items-center gap-3">
                  <FolderOpen className="w-5 h-5" style={{ color: 'hsl(var(--color-primary))' }} />
                  <div>
                    <h3 className="font-medium" style={{ color: 'hsl(var(--color-text))' }}>{group.name}</h3>
                    {group.description && <p className="text-xs" style={{ color: 'hsl(var(--color-text-muted))' }}>{group.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && !isMaster && (
                    <button onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {expandedGroup === group.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
              
              {/* Expanded: show mod permissions */}
              {expandedGroup === group.id && isAdmin && !isMaster && (
                <div className="px-4 pb-4 space-y-2" style={{ borderTop: '1px solid hsl(var(--color-border))' }}>
                  <p className="text-xs font-semibold pt-3 flex items-center gap-2" style={{ color: 'hsl(var(--color-text-muted))' }}>
                    <Users className="w-3.5 h-3.5" /> MODERADORES COM ACESSO
                  </p>
                  {mods.length === 0 ? (
                    <p className="text-xs" style={{ color: 'hsl(var(--color-text-muted))' }}>Nenhum moderador criado.</p>
                  ) : (
                    mods.map((mod: any) => {
                      const hasPerm = (groupPerms[group.id] || []).some(p => p.moderator_id === mod.id)
                      return (
                        <div key={mod.id} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ background: 'hsl(var(--color-bg-surface))' }}>
                          <span className="text-sm" style={{ color: 'hsl(var(--color-text))' }}>{mod.username}</span>
                          <button
                            onClick={() => hasPerm ? revokePerm(group.id, mod.id) : grantPerm(group.id, mod.id)}
                            className="text-xs px-3 py-1 rounded-full font-medium transition-colors"
                            style={{
                              background: hasPerm ? 'hsl(0, 85%, 55% / 0.15)' : 'hsl(var(--color-primary) / 0.15)',
                              color: hasPerm ? 'hsl(0, 85%, 55%)' : 'hsl(var(--color-primary))'
                            }}
                          >
                            {hasPerm ? "Revogar" : "Conceder"}
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
