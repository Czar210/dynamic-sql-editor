'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthContext'
import { Button, Card, Eyebrow, Field, Hairline, Icon, Input, Pill, SectionNum } from '@/components/ui'

type Group = {
  id: number
  name: string
  description: string | null
  admin_id: number
  created_at: string
}

type Mod = { id: number; username: string; role: string }
type Perm = { id: number; moderator_id: number; database_group_id: number }

export default function GroupsPage() {
  const { token, user, isAdmin, isMaster } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])
  const [mods, setMods] = useState<Mod[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null)
  const [groupPerms, setGroupPerms] = useState<Record<number, Perm[]>>({})
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  useEffect(() => {
    fetch(`${API}/api/database-groups`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then((d) => setGroups(Array.isArray(d) ? d : [])).catch(() => {})
    if (isAdmin && !isMaster) {
      fetch(`${API}/api/moderators`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then((d) => setMods(Array.isArray(d) ? d : [])).catch(() => {})
    }
  }, [API, token, isAdmin, isMaster])

  const createGroup = async () => {
    if (!name.trim()) return setErr('O capítulo precisa de um nome.')
    setErr(''); setMsg('')
    const res = await fetch(`${API}/api/database-groups`, {
      method: 'POST', headers, body: JSON.stringify({ name, description }),
    })
    if (res.ok) {
      const g = await res.json()
      setGroups(prev => [...prev, g])
      setName(''); setDescription(''); setCreating(false)
      setMsg('Capítulo criado.')
    } else {
      setErr('Não foi possível criar.')
    }
  }

  const deleteGroup = async (id: number) => {
    if (!confirm('Apagar este capítulo? As tabelas dentro perderão a associação.')) return
    await fetch(`${API}/api/database-groups/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    })
    setGroups(prev => prev.filter(g => g.id !== id))
  }

  const grantPerm = async (groupId: number, modId: number) => {
    const res = await fetch(`${API}/api/database-groups/${groupId}/permissions`, {
      method: 'POST', headers, body: JSON.stringify({ moderator_id: modId }),
    })
    if (res.ok) {
      const newPerm = await res.json()
      setGroupPerms(prev => ({ ...prev, [groupId]: [...(prev[groupId] || []), newPerm] }))
    }
  }

  const revokePerm = async (groupId: number, modId: number) => {
    await fetch(`${API}/api/database-groups/${groupId}/permissions/${modId}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    })
    setGroupPerms(prev => ({
      ...prev,
      [groupId]: (prev[groupId] || []).filter(p => p.moderator_id !== modId),
    }))
  }

  const isMod = user?.role === 'moderator'

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <Eyebrow num={9}>{isMod ? 'Capítulos disponíveis' : 'Grupos de tabelas'}</Eyebrow>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 400,
              letterSpacing: 'var(--tracking-h1)', marginTop: 12, fontStyle: 'italic',
            }}>
              {isMod ? 'Seus capítulos' : 'A organização do acervo'}
            </h1>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', color: 'var(--fg-secondary)',
              maxWidth: 640, marginTop: 12, lineHeight: 1.5,
            }}>
              {isMod
                ? 'Capítulos de banco aos quais você tem acesso de leitura ou edição.'
                : 'Tabelas se agrupam em capítulos. Útil pra navegar e pra dar permissões em bloco.'}
            </p>
          </div>
          {isAdmin && !isMaster && (
            <Button variant="primary" icon="plus" size="md" onClick={() => setCreating(c => !c)}>
              Novo capítulo
            </Button>
          )}
        </div>
      </header>

      <Hairline strong my={8} />

      {/* Create form (inline) */}
      {creating && isAdmin && !isMaster && (
        <Card style={{ marginTop: 24 }}>
          <Eyebrow style={{ marginBottom: 14 }}>Novo capítulo</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Nome">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="ex.: Conteúdo, Catálogo, Assinantes" />
            </Field>
            <Field label="Descrição (opcional)">
              <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="O que vive aqui dentro?" />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant="primary" icon="check" onClick={createGroup}>Criar capítulo</Button>
            <Button variant="ghost" onClick={() => { setCreating(false); setName(''); setDescription(''); setErr('') }}>
              Cancelar
            </Button>
          </div>
          {msg && <p style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ok)' }}>{msg}</p>}
          {err && <p style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)' }}>{err}</p>}
        </Card>
      )}

      {/* Groups list */}
      <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 18 }}>
        {groups.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1', textAlign: 'center', padding: '64px 24px',
            border: '1px dashed var(--rule)', borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16,
            color: 'var(--fg-muted)',
          }}>
            {isMod ? 'Nenhum capítulo atribuído a você.' : 'Nenhum capítulo ainda — crie o primeiro.'}
          </div>
        ) : (
          groups.map((g, i) => {
            const expanded = expandedGroup === g.id
            const perms = groupPerms[g.id] || []
            return (
              <Card key={g.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Eyebrow accent style={{ marginBottom: 6 }}>
                      capítulo · <SectionNum>{String(i + 1).padStart(2, '0')}</SectionNum>
                    </Eyebrow>
                    <h3 style={{
                      fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-xl)',
                      fontWeight: 400, margin: 0, letterSpacing: '-0.01em', color: 'var(--fg-primary)',
                    }}>
                      {g.name}
                    </h3>
                    {g.description && (
                      <p style={{
                        fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--fg-secondary)',
                        margin: '6px 0 0', lineHeight: 1.4,
                      }}>
                        {g.description}
                      </p>
                    )}
                  </div>
                  <Pill tone="muted"><span className="numeric">{perms.length} mods</span></Pill>
                </div>

                <Hairline strong />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.04em' }}>
                    {/* TODO(M6): backend count of tables per group */}
                    associações
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {isAdmin && !isMaster && (
                      <>
                        <Button variant="ghost" size="sm" icon={expanded ? 'chevron_up' : 'chevron_down'}
                          onClick={() => setExpandedGroup(expanded ? null : g.id)}>
                          {expanded ? 'Fechar' : 'Permissões'}
                        </Button>
                        <Button variant="ghost" size="sm" icon="trash" onClick={() => deleteGroup(g.id)} />
                      </>
                    )}
                  </div>
                </div>

                {expanded && isAdmin && !isMaster && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--rule-faint)' }}>
                    <Eyebrow style={{ marginBottom: 10 }}>Moderadores com acesso</Eyebrow>
                    {mods.length === 0 ? (
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>
                        Nenhum moderador criado.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {mods.map(mod => {
                          const has = perms.some(p => p.moderator_id === mod.id)
                          return (
                            <div key={mod.id} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '8px 10px', background: 'var(--bg-sunken)',
                              borderRadius: 'var(--radius-sm)',
                            }}>
                              <span style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-primary)',
                              }}>
                                <Icon name="user" size={13} color="var(--fg-muted)" />
                                @{mod.username}
                              </span>
                              <Button
                                variant={has ? 'danger' : 'secondary'}
                                size="sm"
                                onClick={() => has ? revokePerm(g.id, mod.id) : grantPerm(g.id, mod.id)}
                              >
                                {has ? 'Revogar' : 'Conceder'}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
