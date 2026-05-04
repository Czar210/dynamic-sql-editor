'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { Button, Card, Eyebrow, Hairline, Icon, Input, MMonogram, Pill, SectionNum } from '@/components/ui'

type PublicTable = {
  id: number
  name: string
  description: string | null
  group?: string | null
  columns?: { name: string; data_type: string }[]
}

type Row = Record<string, unknown>

interface Props {
  params: Promise<{ workspace: string }>
}

const FALLBACK_BLURB = 'Catálogo público publicado por Atlas — feito com Mora.'

export default function PublicSitePage({ params }: Props) {
  const { workspace } = use(params)
  const [tables, setTables] = useState<PublicTable[]>([])
  const [search, setSearch] = useState('')
  const [openTable, setOpenTable] = useState<PublicTable | null>(null)
  const [openRows, setOpenRows] = useState<Row[]>([])
  const [loadingRows, setLoadingRows] = useState(false)

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    // TODO(M6): backend filter by workspace_slug — for now we fetch all public
    fetch(`${API}/public/tables/`)
      .then(r => r.json())
      .then((d) => setTables(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [API])

  useEffect(() => {
    if (!openTable) return
    setLoadingRows(true)
    fetch(`${API}/public/api/${openTable.name}?limit=20`)
      .then(r => r.json())
      .then((res) => {
        const rows = Array.isArray(res) ? res : (res?.data || [])
        setOpenRows(rows)
      })
      .catch(() => setOpenRows([]))
      .finally(() => setLoadingRows(false))
  }, [API, openTable])

  const filtered = tables.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return t.name.toLowerCase().includes(q) ||
      (t.description ?? '').toLowerCase().includes(q)
  })

  const wsTitle = workspace
    .split('-')
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--fg-primary)' }}>
      {/* Top strip */}
      <header style={{
        padding: '20px 48px', borderBottom: '1px solid var(--rule)',
        background: 'var(--bg-surface)', display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', gap: 16,
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--fg-muted)', textDecoration: 'none',
        }}>
          Atlas · {workspace}.atlas
        </Link>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
          publicação · CC BY-SA
        </span>
      </header>

      {/* Hero / masthead */}
      <section className="paper-texture" style={{
        padding: '64px 48px 48px', borderBottom: '2px solid var(--fg-primary)',
        maxWidth: 1200, margin: '0 auto', position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 32, right: 48, opacity: 0.85 }}>
          <MMonogram size={72} color="var(--accent-text)" />
        </div>
        <Eyebrow accent style={{ marginBottom: 18 }}>
          {wsTitle} · edição vigente
        </Eyebrow>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400,
          fontSize: 88, lineHeight: 0.95, letterSpacing: 'var(--tracking-display)', margin: 0,
          color: 'var(--fg-primary)',
        }}>
          {wsTitle}.
        </h1>
        <p className="drop-cap" style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--fg-secondary)',
          maxWidth: 560, marginTop: 24, lineHeight: 1.5, fontStyle: 'italic',
        }}>
          {FALLBACK_BLURB}
        </p>

        <div style={{ marginTop: 36, maxWidth: 480, borderBottom: '2px solid var(--rule-strong, var(--fg-primary))' }}>
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon="search"
            placeholder="busque um ensaio, uma seção, um termo…"
            style={{ padding: '14px 14px 14px 40px', fontSize: 16, border: 'none', background: 'transparent' }}
          />
        </div>
      </section>

      {/* Articles list */}
      <section style={{ padding: '48px 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16 }}>
          <Eyebrow>I · Ensaios em destaque</Eyebrow>
          <span className="numeric" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase' }}>
            {filtered.length} {filtered.length === 1 ? 'tabela pública' : 'tabelas públicas'}
          </span>
        </div>

        {filtered.length === 0 ? (
          <div style={{
            padding: '80px 24px', textAlign: 'center',
            border: '1px dashed var(--rule)', borderRadius: 'var(--radius-md)',
          }}>
            <Icon name="info" size={28} color="var(--fg-muted)" />
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16,
              color: 'var(--fg-muted)', marginTop: 14,
            }}>
              {/* TODO(M6): backend filter by workspace_slug */}
              Nenhum conteúdo público para "{workspace}" ainda.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((t, i) => (
              <article
                key={t.id}
                onClick={() => setOpenTable(t)}
                style={{
                  padding: '24px 0', borderTop: i === 0 ? '1px solid var(--fg-primary)' : '1px solid var(--rule-faint)',
                  display: 'grid', gridTemplateColumns: '80px 1fr auto',
                  gap: 24, alignItems: 'baseline', cursor: 'pointer',
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 42, color: 'var(--accent-text)', lineHeight: 1,
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <Eyebrow style={{ marginBottom: 8 }}>
                    {t.group || 'tabela pública'}
                  </Eyebrow>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 'var(--text-2xl)', fontWeight: 400, margin: '0 0 6px',
                    lineHeight: 1.1, letterSpacing: '-0.01em',
                  }}>
                    {t.name}
                  </h3>
                  {t.description && (
                    <p style={{
                      fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--fg-secondary)',
                      margin: 0, lineHeight: 1.5,
                    }}>
                      {t.description}
                    </p>
                  )}
                  <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(t.columns || []).slice(0, 4).map(c => (
                      <Pill key={c.name} tone="muted">{c.name}</Pill>
                    ))}
                  </div>
                </div>
                <Icon name="chevron_right" size={16} color="var(--fg-muted)" />
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer / colofão */}
      <footer style={{
        padding: '20px 48px', background: 'var(--fg-primary)',
        color: 'var(--fg-inverse)', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span className="numeric" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', opacity: 0.7 }}>
          publicado por atlas · {wsTitle} · CC BY-SA 4.0
        </span>
        <span className="glyph-m" style={{ fontSize: 22, opacity: 0.9, color: 'var(--fg-inverse)' }}>
          M
        </span>
      </footer>

      {/* Side drawer for record detail */}
      {openTable && (
        <>
          <div
            onClick={() => setOpenTable(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 50,
            }}
          />
          <aside style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(560px, 100vw)',
            background: 'var(--bg-surface)', borderLeft: '1px solid var(--rule)',
            boxShadow: 'var(--shadow-lg)', zIndex: 51, overflowY: 'auto',
          }}>
            <div style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
                <Eyebrow accent>{openTable.group || 'tabela pública'}</Eyebrow>
                <Button variant="ghost" size="sm" icon="close" onClick={() => setOpenTable(null)}>
                  Fechar
                </Button>
              </div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic',
                fontSize: 'var(--text-3xl)', fontWeight: 400, margin: 0, letterSpacing: '-0.01em',
              }}>
                {openTable.name}
              </h2>
              {openTable.description && (
                <p style={{
                  fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', color: 'var(--fg-secondary)',
                  margin: '12px 0 0', lineHeight: 1.5,
                }}>
                  {openTable.description}
                </p>
              )}

              <Hairline strong my={24} />

              <Eyebrow style={{ marginBottom: 12 }}>Registros · amostra</Eyebrow>
              {loadingRows ? (
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)' }}>
                  Carregando…
                </p>
              ) : openRows.length === 0 ? (
                <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--fg-muted)' }}>
                  Nada para mostrar.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {openRows.map((row, i) => (
                    <Card key={i}>
                      <SectionNum>{String(i + 1).padStart(2, '0')}</SectionNum>
                      <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
                        {Object.entries(row).slice(0, 8).map(([k, v]) => (
                          <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                            <span style={{
                              fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em',
                              textTransform: 'uppercase', color: 'var(--fg-muted)', minWidth: 100,
                            }}>
                              {k}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-primary)',
                              wordBreak: 'break-word',
                            }}>
                              {v === null || v === undefined ? '—' : String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
