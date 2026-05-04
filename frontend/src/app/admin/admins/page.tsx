'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthContext'
import { Button, Card, Eyebrow, Field, Hairline, Input, Pill } from '@/components/ui'

type Admin = {
  id: number
  username: string
  role: string
  workspace_name?: string | null
  workspace_slug?: string | null
  created_at?: string
}

export default function AdminsPage() {
  const { token, isMaster } = useAuth()
  const [admins, setAdmins] = useState<Admin[]>([])
  const [creating, setCreating] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    if (!isMaster) return
    fetch(`${API}/api/admins`, { headers })
      .then(r => r.json()).then((d) => setAdmins(Array.isArray(d) ? d : [])).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API, token, isMaster])

  if (!isMaster) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
        Acesso restrito ao Master.
      </div>
    )
  }

  const createAdmin = async () => {
    if (!username || !password) return setErr('Preencha username e senha.')
    setErr(''); setMsg('')
    const res = await fetch(`${API}/api/admins`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role: 'admin' }),
    })
    if (res.ok) {
      const a = await res.json()
      setAdmins(prev => [...prev, a])
      setUsername(''); setPassword(''); setCreating(false)
      setMsg('Administrador provisionado.')
    } else {
      const e = await res.json().catch(() => ({}))
      setErr(e.detail || 'Erro ao criar.')
    }
  }

  const deleteAdmin = async (id: number) => {
    if (!confirm('Apagar este admin? O workspace dele perderá o gestor.')) return
    const res = await fetch(`${API}/api/admins/${id}`, { method: 'DELETE', headers })
    if (res.ok) setAdmins(prev => prev.filter(a => a.id !== id))
  }

  // Mock KPIs supplemented by real admin count
  const kpis: { n: string; l: string }[] = [
    { n: String(admins.length), l: 'workspaces ativos' },
    { n: '47', l: 'tabelas no total' },
    { n: '16', l: 'moderadores' },
    { n: '0.48', l: 'TB usados de 2' },
  ]

  return (
    <div>
      {/* Masthead */}
      <header style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 24 }}>
          <div>
            <Eyebrow num={10} style={{ color: 'var(--danger)' }}>Modo master · instância mora</Eyebrow>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 400,
              letterSpacing: '-0.02em', marginTop: 12, fontStyle: 'italic',
            }}>
              Painel master
            </h1>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', color: 'var(--fg-secondary)',
              maxWidth: 640, marginTop: 12, lineHeight: 1.5,
            }}>
              Visão de quem opera o Atlas. Workspaces, quotas, telemetria — sem ver dados de cliente.
            </p>
          </div>
          <Button variant="danger" icon="plus" size="md" onClick={() => setCreating(c => !c)}>
            Provisionar workspace
          </Button>
        </div>
      </header>

      <Hairline strong my={8} />

      {/* KPIs strip */}
      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {kpis.map((k, i) => (
          <Card key={i}>
            <Eyebrow style={{ marginBottom: 10 }}>{`indicador ${String.fromCharCode(65 + i)}`}</Eyebrow>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 400,
              color: i === 3 ? 'var(--danger)' : 'var(--accent-text)', lineHeight: 1, marginTop: 6,
            }}>
              {k.n}
            </div>
            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13,
              color: 'var(--fg-secondary)', marginTop: 6,
            }}>
              {k.l}
            </div>
          </Card>
        ))}
      </div>

      {/* Create form */}
      {creating && (
        <Card style={{ marginTop: 28 }}>
          <Eyebrow style={{ marginBottom: 14 }}>Novo administrador</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="Username">
              <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="ex.: liana" mono />
            </Field>
            <Field label="Senha inicial">
              <Input value={password} onChange={e => setPassword(e.target.value)} type="password" />
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <Button variant="primary" icon="check" onClick={createAdmin}>Provisionar</Button>
            <Button variant="ghost" onClick={() => { setCreating(false); setUsername(''); setPassword(''); setErr('') }}>Cancelar</Button>
          </div>
          {msg && <p style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ok)' }}>{msg}</p>}
          {err && <p style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--danger)' }}>{err}</p>}
        </Card>
      )}

      {/* Admins table */}
      <div style={{ marginTop: 28 }}>
        <Eyebrow style={{ marginBottom: 12 }}>Workspaces sob administração</Eyebrow>
        <Card padding={false}>
          <div style={{
            display: 'grid', gridTemplateColumns: '60px 2fr 2fr 1fr 1.5fr 100px',
            padding: '12px 18px', background: 'var(--bg-sunken)',
            borderBottom: '1px solid var(--rule)', gap: 14, alignItems: 'center',
          }}>
            {['#', 'Admin', 'Workspace', 'Role', 'Quota', ''].map(h => (
              <Eyebrow key={h} style={{ fontSize: 9 }}>{h}</Eyebrow>
            ))}
          </div>
          {admins.length === 0 ? (
            <div style={{
              padding: '40px 24px', textAlign: 'center', fontFamily: 'var(--font-display)',
              fontStyle: 'italic', fontSize: 14, color: 'var(--fg-muted)',
            }}>
              Nenhum admin provisionado.
            </div>
          ) : admins.map((a, i) => {
            const quotaUsed = 0.2 + ((a.id * 7) % 60) / 100
            const initial = a.username.charAt(0).toUpperCase()
            return (
              <div key={a.id} style={{
                display: 'grid', gridTemplateColumns: '60px 2fr 2fr 1fr 1.5fr 100px',
                padding: '14px 18px', borderBottom: '1px solid var(--rule-faint)',
                gap: 14, alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 'var(--radius-full)',
                    background: 'var(--accent)', color: 'var(--fg-inverse)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500,
                  }}>
                    {initial}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--fg-primary)' }}>
                      {a.username}
                    </div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)' }}>
                      @{a.username}
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--fg-primary)' }}>
                  {a.workspace_name || `${a.username}.atlas`}
                </div>
                <Pill tone="admin" dot>admin</Pill>
                <div>
                  <div style={{ height: 6, background: 'var(--rule-faint)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${quotaUsed * 100}%`,
                      background: quotaUsed > 0.7 ? 'var(--danger)' : 'var(--accent)',
                    }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', marginTop: 4, display: 'block' }}>
                    {Math.round(quotaUsed * 100)}%
                  </span>
                </div>
                <Button variant="danger" size="sm" icon="trash" onClick={() => deleteAdmin(a.id)}>
                  Apagar
                </Button>
              </div>
            )
          })}
        </Card>
      </div>
    </div>
  )
}
