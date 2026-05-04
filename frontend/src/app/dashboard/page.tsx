"use client"
import React, { useEffect, useMemo, useState } from 'react'
import BarChartWidget from '@/components/widgets/BarChartWidget'
import { Card, Eyebrow, Hairline, Pill, SectionNum } from '@/components/ui'
import { useAuth } from '@/components/AuthContext'

interface TableMeta {
  row_count: number
  column_count: number
  relation_count: number
}

interface DynamicTable {
  id: number
  name: string
  description?: string | null
  created_at: string
  is_public: boolean
  owner_id: number
  meta?: TableMeta
}

const MONTHS_PT = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

function editorialDate(): string {
  const d = new Date()
  return `${d.getDate()} de ${MONTHS_PT[d.getMonth()]} de ${d.getFullYear()}`
}

// TODO(M6): wire to real metrics
const STATIC_NUMBERS: Array<[string, string]> = [
  ['47', 'templos'],
  ['6', 'linhagens'],
  ['1.247', 'visitas'],
]

// TODO(M6): wire to backend
const STATIC_AGENDA = [
  { date: '12 OUT', title: 'Sesshin de outono', where: 'Pico de Raios · ES' },
  { date: '07 NOV', title: 'Retiro de silêncio', where: 'Khadro Ling · RS' },
  { date: '21 DEZ', title: 'Vigília de Rōhatsu', where: 'Busshinji · SP' },
  { date: '14 JAN', title: 'Curso introdutório', where: 'Online · Zoom' },
]

// TODO(M6): wire to backend
const STATIC_LINEAGES = ['Zen', 'Theravada', 'Vajrayana', 'Pure Land', 'Nichiren', 'Secular']

export default function PublicDashboard() {
  const { user, token } = useAuth()
  const [tables, setTables] = useState<DynamicTable[]>([])
  const [posts, setPosts] = useState<any[]>([])

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
    fetch(`${API}/tables/`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(d => setTables(Array.isArray(d) ? d : []))
      .catch(() => { /* ignore */ })

    fetch(`${API}/api/posts`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setPosts(Array.isArray(d) ? d : []))
      .catch(() => { /* ignore */ })
  }, [API, token])

  const featured = useMemo(() => {
    const sorted = [...tables].sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''))
    return sorted.slice(0, 3)
  }, [tables])

  const workspaceName = user?.workspace_name ?? 'Atlas'
  const today = useMemo(editorialDate, [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--fg-primary)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 48px 80px', display: 'flex', flexDirection: 'column', gap: 48 }}>

        {/* Masthead — capa de revista */}
        <header>
          <Eyebrow accent style={{ marginBottom: 18, fontSize: 12 }}>
            Volume 1 · Número 1 · {today}
          </Eyebrow>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontStyle: 'italic',
              fontSize: 'clamp(72px, 11vw, 128px)',
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              margin: '0 0 24px',
              color: 'var(--fg-primary)',
            }}
          >
            {workspaceName}.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: 22,
              lineHeight: 1.4,
              color: 'var(--fg-secondary)',
              maxWidth: 640,
              margin: '0 0 28px',
            }}
          >
            Uma publicação contínua sobre dados editoriais.
          </p>
          <Hairline strong />
        </header>

        {/* Featured — 3 destaques */}
        <section>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
            <Eyebrow>I · Em destaque</Eyebrow>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', color: 'var(--fg-muted)', textTransform: 'uppercase' }}>
              últimos modelos
            </span>
          </div>

          {featured.length === 0 ? (
            <Card>
              <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--fg-secondary)', textAlign: 'center', padding: 24, margin: 0 }}>
                Nenhum modelo catalogado ainda.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {featured.map((t, i) => (
                <Card key={t.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <SectionNum>{String(i + 1).padStart(2, '0')}</SectionNum>
                    <Eyebrow style={{ fontSize: 9 }}>{t.is_public ? 'Público' : 'Privado'}</Eyebrow>
                  </div>
                  <h3
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: 24,
                      fontWeight: 400,
                      margin: '0 0 8px',
                      letterSpacing: '-0.005em',
                      lineHeight: 1.15,
                    }}
                  >
                    {t.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: 13,
                      color: 'var(--fg-secondary)',
                      margin: '0 0 14px',
                      lineHeight: 1.4,
                      minHeight: 36,
                    }}
                  >
                    {t.description || '—'}
                  </p>
                  <Hairline />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
                      registros
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--accent-text)' }}>
                      {(t.meta?.row_count ?? 0).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Strip de números — TODO(M6): wire to real metrics */}
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 24,
              padding: '32px 0',
              borderTop: '2px solid var(--fg-primary)',
              borderBottom: '2px solid var(--fg-primary)',
            }}
          >
            {STATIC_NUMBERS.map(([n, label], i) => (
              <React.Fragment key={i}>
                {i > 0 && (
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--fg-muted)' }}>—</span>
                )}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontStyle: 'italic',
                      fontSize: 38,
                      color: 'var(--accent-text)',
                      lineHeight: 1,
                    }}
                  >
                    {n}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 11,
                      letterSpacing: '0.16em',
                      textTransform: 'uppercase',
                      color: 'var(--fg-secondary)',
                    }}
                  >
                    {label}
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>

        {/* Chart wrapped editorially */}
        <section>
          <Eyebrow style={{ marginBottom: 12 }}>II · Métricas</Eyebrow>
          <Card>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
              <Eyebrow style={{ fontSize: 9 }}>posts</Eyebrow>
              <h3
                style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 24,
                  fontWeight: 400,
                  margin: 0,
                  letterSpacing: '-0.005em',
                }}
              >
                Distribuição de visualizações
              </h3>
            </div>
            <div style={{ height: 320 }}>
              <BarChartWidget
                title=""
                data={posts}
                dataKeyX="title"
                dataKeyY="views"
                color="var(--accent)"
              />
            </div>
          </Card>
        </section>

        {/* Two-column: Agenda + Linhagens */}
        <section className="grid gap-6" style={{ gridTemplateColumns: '2fr 1fr' }}>
          <div>
            <Eyebrow style={{ marginBottom: 14 }}>III · Próximos eventos</Eyebrow>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {STATIC_AGENDA.map((e, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    gap: 20,
                    padding: '18px 0',
                    borderTop: i === 0 ? '1px solid var(--fg-primary)' : '1px solid var(--rule-faint)',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.16em', color: 'var(--accent-text)' }}>
                    {e.date}
                  </span>
                  <div>
                    <h4
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontStyle: 'italic',
                        fontSize: 20,
                        fontWeight: 400,
                        margin: '0 0 4px',
                        lineHeight: 1.15,
                      }}
                    >
                      {e.title}
                    </h4>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--fg-secondary)', margin: 0 }}>
                      {e.where}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside>
            <Eyebrow style={{ marginBottom: 14 }}>Linhagens</Eyebrow>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {STATIC_LINEAGES.map(l => (
                <Pill key={l} tone="muted">{l}</Pill>
              ))}
            </div>
          </aside>
        </section>

        {/* Colofão */}
        <footer
          style={{
            marginTop: 32,
            paddingTop: 20,
            borderTop: '1px solid var(--rule)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--fg-muted)',
            }}
          >
            Editado por {workspaceName}. Powered by Atlas — uma ferramenta Mora.
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--fg-muted)',
            }}
          >
            CC BY-SA 4.0
          </span>
        </footer>
      </div>
    </div>
  )
}
