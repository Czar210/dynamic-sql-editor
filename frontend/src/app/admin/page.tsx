'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/AuthContext'
import { Card, Eyebrow, Hairline, MMonogram, Pill, SectionNum } from '@/components/ui'

type TableMeta = {
  id: number
  name: string
  is_public: boolean
  meta?: { row_count: number; column_count: number; relation_count: number }
}

function editorialDate() {
  return new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function AdminOverview() {
  const { user, token } = useAuth()
  const [tables, setTables] = useState<TableMeta[]>([])
  const today = useMemo(editorialDate, [])

  useEffect(() => {
    if (!token) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/tables/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => setTables(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [token])

  const totalTables = tables.length
  const publicTables = tables.filter(t => t.is_public).length
  const totalRecords = tables.reduce((sum, t) => sum + (t.meta?.row_count ?? 0), 0)
  const totalRelations = tables.reduce((sum, t) => sum + (t.meta?.relation_count ?? 0), 0)
  const workspaceName = user?.workspace_name ?? 'Atlas'

  const kpis = [
    { num: '01', label: 'Tabelas', value: totalTables, hint: `${publicTables} pública${publicTables === 1 ? '' : 's'}` },
    { num: '02', label: 'Registros', value: totalRecords.toLocaleString('pt-BR'), hint: 'todas as tabelas' },
    { num: '03', label: 'Relações', value: totalRelations, hint: 'foreign keys' },
    { num: '04', label: 'Uptime', value: '99.9%', hint: 'estável' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--fg-primary)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 0 80px', display: 'flex', flexDirection: 'column', gap: 40 }}>

        <header className="paper-texture" style={{ position: 'relative', padding: '8px 0 4px' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.7 }}>
            <MMonogram size={48} color="var(--accent-text)" />
          </div>
          <Eyebrow accent style={{ marginBottom: 14 }}>
            Edição administrativa · {today}
          </Eyebrow>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: 'clamp(48px, 6vw, 72px)',
              lineHeight: 1,
              letterSpacing: 'var(--tracking-h1)',
              margin: '0 0 18px',
              textWrap: 'balance',
            }}
          >
            Bom dia, {user?.username}.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 18,
              lineHeight: 1.5,
              color: 'var(--fg-secondary)',
              maxWidth: 560,
              margin: 0,
            }}
          >
            O painel de {workspaceName} em um relance — métricas, mudanças recentes e estado do sistema.
          </p>
        </header>

        <Hairline strong />

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
          {kpis.map(k => (
            <Card key={k.num} padding raised={false} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <SectionNum>{k.num}</SectionNum>
                <Eyebrow>{k.label}</Eyebrow>
              </div>
              <div
                className="numeric"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 400,
                  fontSize: 56,
                  lineHeight: 1,
                  letterSpacing: 'var(--tracking-h1)',
                  fontVariationSettings: '"opsz" 144, "SOFT" 50',
                  color: 'var(--fg-primary)',
                }}
              >
                {k.value}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase' }}>
                {k.hint}
              </div>
            </Card>
          ))}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24 }}>
          <Card padding>
            <Eyebrow num="A" accent style={{ marginBottom: 16 }}>
              Mudanças recentes
            </Eyebrow>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 22, margin: '0 0 16px' }}>
              No índice editorial
            </h3>
            {tables.length === 0 ? (
              <p style={{ color: 'var(--fg-muted)', fontSize: 13, margin: 0 }}>
                Sem tabelas ainda. Comece criando uma em <em>Tabelas</em>.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {tables.slice(0, 5).map(t => (
                  <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: 12, borderBottom: '1px solid var(--rule-faint)' }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, color: 'var(--fg-primary)' }}>{t.name}</div>
                      <div className="numeric" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>
                        {t.meta?.row_count ?? 0} registros · {t.meta?.column_count ?? 0} colunas
                      </div>
                    </div>
                    {t.is_public ? <Pill tone="ok" dot>Público</Pill> : <Pill tone="muted">Privado</Pill>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card padding>
            <Eyebrow num="B" accent style={{ marginBottom: 16 }}>
              Estado do sistema
            </Eyebrow>
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 22, margin: '0 0 20px' }}>
              Infraestrutura
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { k: 'Ambiente', v: process.env.NODE_ENV === 'production' ? 'Produção' : 'Desenvolvimento', tone: 'ok' as const },
                { k: 'Banco', v: 'SQLite local', tone: 'muted' as const },
                { k: 'API', v: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000', tone: 'muted' as const },
                { k: 'Versão', v: 'v1.3.0 — Atlas', tone: 'accent' as const },
              ].map(row => (
                <li key={row.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: '1px solid var(--rule-faint)' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase' }}>{row.k}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-secondary)' }}>{row.v}</span>
                </li>
              ))}
            </ul>
          </Card>
        </section>

      </div>
    </div>
  )
}
