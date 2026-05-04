'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthContext'
import { Button, Card, Eyebrow, Field, Hairline, Icon, Input, Pill } from '@/components/ui'

type Mod = {
  id: number
  username: string
  role: string
  parent_id?: number | null
  created_at?: string
}

type Group = { id: number; name: string; description: string | null }
type Perm = { id: number; moderator_id: number; database_group_id: number; can_write?: boolean }
type PermState = Record<number, { read: boolean; write: boolean }>

export default function ModeratorsPage() {
  const { token, isAdmin, isMaster } = useAuth()
  const [mods, setMods] = useState<Mod[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [permsByMod, setPermsByMod] = useState<Record<number, PermState>>({})

  const [creating, setCreating] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [resetId, setResetId] = useState<number | null>(null)
  const [newPass, setNewPass] = useState('')
  const [resetResult, setResetResult] = useState<string | null>(null)

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const headers = { Authorization: `Bearer ${token}` }
  const jsonHeaders = { ...headers, 'Content-Type': 'application/json' }

  const fetchMods = () => {
    fetch(`${API}/api/moderators`, { headers })
      .then(r => r.json())
      .then((d) => {
        const arr = Array.isArray(d) ? d : []
        setMods(arr)
        if (arr.length && selectedId === null) setSelectedId(arr[0].id)
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchMods()
    fetch(`${API}/api/database-groups`, { headers })
      .then(r => r.json()).then((d) => setGroups(Array.isArray(d) ? d : [])).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API, token])

  // Load mod permissions when a mod is selected
  useEffect(() => {
    if (selectedId === null) return
    if (permsByMod[selectedId]) return
    fetch(`${API}/api/moderator-permissions/${selectedId}`, { headers })
      .then(r => r.json())
      .then((d: Perm[]) => {
        const ps: PermState = {}
        if (Array.isArray(d)) {
          d.forEach(p => {
            ps[p.database_group_id] = { read: true, write: !!p.can_write }
          })
        }
        setPermsByMod(prev => ({ ...prev, [selectedId]: ps }))
      })
      .catch(() => {
        setPermsByMod(prev => ({ ...prev, [selectedId]: {} }))
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  if (!isAdmin || isMaster) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
        Acesso restrito a administradores.
      </div>
    )
  }

  const selected = mods.find(m => m.id === selectedId) || null
  const selectedPerms: PermState = (selectedId !== null && permsByMod[selectedId]) || {}

  const createMod = async () => {
    if (!username || !password) return setErr('Preencha username e senha.')
    setErr(''); setMsg('')
    const res = await fetch(`${API}/api/moderators`, {
      method: 'POST', headers: jsonHeaders, body: JSON.stringify({ username, password, role: 'moderator' }),
    })
    if (res.ok) {
      setUsername(''); setPassword(''); setCreating(false)
      setMsg('Moderador criado.')
      fetchMods()
    } else {
      const e = await res.json().catch(() => ({}))
      setErr(e.detail || 'Erro ao criar.')
    }
  }

  const deleteMod = async (id: number) => {
    if (!confirm('Apagar este moderador?')) return
    const res = await fetch(`${API}/api/moderators/${id}`, { method: 'DELETE', headers })
    if (res.ok) {
      if (selectedId === id) setSelectedId(null)
      fetchMods()
    }
  }

  const resetPassword = async (id: number) => {
    if (!newPass) return
    const res = await fetch(`${API}/api/moderators/${id}/reset-password`, {
      method: 'POST', headers: jsonHeaders, body: JSON.stringify({ new_password: newPass }),
    })
    if (res.ok) {
      setResetResult(newPass)
      setNewPass('')
    }
  }

  const togglePerm = async (groupId: number, perm: 'read' | 'write') => {
    if (selectedId === null) return
    const cur = selectedPerms[groupId] || { read: false, write: false }
    let next = { ...cur, [perm]: !cur[perm] }
    if (perm === 'write' && next.write) next = { ...next, read: true }
    if (perm === 'read' && !next.read) next = { ...next, write: false }

    setPermsByMod(prev => ({
      ...prev,
      [selectedId]: { ...(prev[selectedId] || {}), [groupId]: next },
    }))

    if (next.read || next.write) {
      await fetch(`${API}/api/moderator-permissions`, {
        method: 'POST', headers: jsonHeaders,
        body: JSON.stringify({ moderator_id: selectedId, group_id: groupId, can_write: next.write }),
      })
    } else {
      // TODO(M6): explicit DELETE moderator-permissions endpoint
    }
  }

  const summary = (gid: number): React.ReactNode => {
    const p = selectedPerms[gid]
    if (!p || (!p.read && !p.write)) return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>—</span>
    if (p.write) return <Pill tone="accent">edita</Pill>
    return <Pill tone="muted">lê</Pill>
  }

  return (
    <div>
      {/* Masthead */}
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <Eyebrow num={6}>{mods.length} moderadores · {groups.length} capítulos</Eyebrow>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 400,
              letterSpacing: '-0.02em', marginTop: 12, fontStyle: 'italic',
            }}>
              Moderadores
            </h1>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', color: 'var(--fg-secondary)',
              maxWidth: 640, marginTop: 12, lineHeight: 1.5,
            }}>
              O chão de fábrica. Cada moderador vê apenas os capítulos que você der.
            </p>
          </div>
          <Button variant="primary" icon="plus" size="md" onClick={() => setCreating(c => !c)}>
            Novo moderador
          </Button>
        </div>
      </header>

      <Hairline strong my={8} />

      {creating && (
        <Card style={{ marginTop: 24 }}>
          <Eyebrow style={{ marginBottom: 14 }}>Criar moderador</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Username">
              <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="ex.: maria" mono />
            </Field>
            <Field label="Senha inicial">
              <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="mínimo 6 caracteres" />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant="primary" icon="check" onClick={createMod}>Criar</Button>
            <Button variant="ghost" onClick={() => { setCreating(false); setUsername(''); setPassword(''); setErr('') }}>Cancelar</Button>
          </div>
          {msg && <p style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ok)' }}>{msg}</p>}
          {err && <p style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)' }}>{err}</p>}
        </Card>
      )}

      {/* 2-col layout */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left: list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Eyebrow style={{ marginBottom: 6 }}>Lista</Eyebrow>
          {mods.length === 0 ? (
            <div style={{
              padding: 16, border: '1px dashed var(--rule)', borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--fg-muted)',
              textAlign: 'center',
            }}>
              Nenhum moderador.
            </div>
          ) : (
            mods.map(m => {
              const active = selectedId === m.id
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', width: '100%', textAlign: 'left', cursor: 'pointer',
                    background: active ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                    border: '1px solid var(--rule)',
                    borderLeft: `3px solid ${active ? 'var(--accent)' : 'transparent'}`,
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--radius-full)',
                    background: 'var(--bg-sunken)', color: 'var(--fg-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 500, flexShrink: 0,
                  }}>
                    {m.username.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--fg-primary)' }}>
                      {m.username}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginTop: 2 }}>
                      @{m.username}
                    </div>
                  </div>
                  <Pill tone="moderator">mod</Pill>
                </button>
              )
            })
          )}
        </div>

        {/* Right: details + permissions matrix */}
        <div>
          {selected ? (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-sunken)', color: 'var(--fg-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-display)', fontSize: 22,
                }}>
                  {selected.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 400, margin: 0 }}>
                    {selected.username}
                  </h2>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', marginTop: 4 }}>
                    @{selected.username} · id {selected.id}
                  </div>
                </div>
                <Button variant="ghost" size="sm" icon="lock"
                  onClick={() => { setResetId(resetId === selected.id ? null : selected.id); setResetResult(null) }}>
                  Resetar senha
                </Button>
                <Button variant="danger" size="sm" icon="trash" onClick={() => deleteMod(selected.id)}>
                  Apagar
                </Button>
              </div>

              {resetId === selected.id && (
                <div style={{ marginBottom: 18, padding: 14, background: 'var(--bg-sunken)', borderRadius: 'var(--radius-md)' }}>
                  {resetResult ? (
                    <>
                      <Eyebrow style={{ marginBottom: 8 }}>Nova senha gerada</Eyebrow>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, padding: 10, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', color: 'var(--fg-primary)' }}>
                        {resetResult}
                      </div>
                      <Button variant="ghost" size="sm" style={{ marginTop: 10 }} onClick={() => { setResetId(null); setResetResult(null) }}>
                        Fechar
                      </Button>
                    </>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <Field label="Nova senha">
                          <Input value={newPass} onChange={e => setNewPass(e.target.value)} type="password" />
                        </Field>
                      </div>
                      <Button variant="primary" onClick={() => resetPassword(selected.id)}>Confirmar</Button>
                    </div>
                  )}
                </div>
              )}

              <Eyebrow style={{ marginBottom: 10 }}>Matriz de permissões</Eyebrow>
              <div style={{ border: '1px solid var(--rule)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 90px 90px 100px',
                  padding: '10px 16px', background: 'var(--bg-sunken)',
                  borderBottom: '1px solid var(--rule)', alignItems: 'center', gap: 12,
                }}>
                  <Eyebrow style={{ fontSize: 9 }}>Capítulo</Eyebrow>
                  <Eyebrow style={{ fontSize: 9, justifyContent: 'center' }}>ler</Eyebrow>
                  <Eyebrow style={{ fontSize: 9, justifyContent: 'center' }}>escrever</Eyebrow>
                  <Eyebrow style={{ fontSize: 9, justifyContent: 'center' }}>resumo</Eyebrow>
                </div>
                {groups.length === 0 ? (
                  <div style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--fg-muted)' }}>
                    Nenhum capítulo criado ainda.
                  </div>
                ) : (
                  groups.map(g => {
                    const p = selectedPerms[g.id] || { read: false, write: false }
                    return (
                      <div key={g.id} style={{
                        display: 'grid', gridTemplateColumns: '1fr 90px 90px 100px',
                        padding: '12px 16px', borderBottom: '1px solid var(--rule-faint)',
                        alignItems: 'center', gap: 12,
                      }}>
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--fg-primary)' }}>
                            {g.name}
                          </div>
                          {g.description && (
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>
                              {g.description}
                            </div>
                          )}
                        </div>
                        <PermBox checked={p.read} onChange={() => togglePerm(g.id, 'read')} />
                        <PermBox checked={p.write} disabled={!p.read} onChange={() => togglePerm(g.id, 'write')} />
                        <div style={{ textAlign: 'center' }}>{summary(g.id)}</div>
                      </div>
                    )
                  })
                )}
              </div>

              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--fg-muted)', marginTop: 16 }}>
                Permissões herdam: para escrever é preciso ler.
              </p>
            </Card>
          ) : (
            <Card>
              <div style={{ padding: 32, textAlign: 'center' }}>
                <Icon name="users" size={32} color="var(--fg-muted)" />
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--fg-muted)', marginTop: 12 }}>
                  Selecione um moderador para editar as permissões.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function PermBox({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      style={{
        width: 22, height: 22, borderRadius: 'var(--radius-sm)',
        border: `1px solid ${disabled ? 'var(--rule-faint)' : checked ? 'var(--accent)' : 'var(--rule)'}`,
        background: checked ? 'var(--accent)' : 'var(--bg-elevated)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto', opacity: disabled ? 0.4 : 1,
      }}
    >
      {checked && <Icon name="check" size={12} color="var(--fg-inverse)" />}
    </button>
  )
}
