'use client'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { Card, Eyebrow, Hairline, Icon, Input, MMonogram, Pill, SectionNum } from '@/components/ui'

type PublicTable = {
  id: number
  name: string
  description: string | null
  columns?: { name: string; data_type: string; is_primary?: boolean }[]
  group?: string | null
  count?: number
}

const ACCENT_TONES = ['var(--accent)', 'var(--ok)', 'var(--warn)', 'var(--danger)']

export default function ExplorePage() {
  const [tables, setTables] = useState<PublicTable[]>([])
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('todos')
  const [previews, setPreviews] = useState<Record<string, unknown[]>>({})

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetch(`${API}/public/tables/`)
      .then(r => r.json())
      .then((d: PublicTable[]) => setTables(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [API])

  useEffect(() => {
    // Fetch preview rows for the visible tables (up to 6)
    tables.slice(0, 6).forEach(t => {
      if (previews[t.name]) return
      fetch(`${API}/public/api/${t.name}?limit=2`)
        .then(r => r.json())
        .then((res) => {
          const rows = Array.isArray(res) ? res : (res?.data || [])
          setPreviews(prev => ({ ...prev, [t.name]: rows }))
        })
        .catch(() => {})
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tables])

  const groups = useMemo(() => {
    const set = new Set<string>(['todos'])
    tables.forEach(t => { if (t.group) set.add(t.group) })
    return Array.from(set)
  }, [tables])

  const filtered = tables.filter(t => {
    if (activeFilter !== 'todos' && t.group !== activeFilter) return false
    if (!search) return true
    const q = search.toLowerCase()
    return t.name.toLowerCase().includes(q) ||
      (t.description ?? '').toLowerCase().includes(q)
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--fg-primary)' }}>
      {/* Top bar */}
      <header style={{
        padding: '20px 48px', borderBottom: '1px solid var(--rule)',
        background: 'var(--bg-surface)', display: 'flex', alignItems: 'baseline',
        justifyContent: 'space-between', gap: 16,
      }}>
        <Link href="/" style={{
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500,
          color: 'var(--fg-primary)', letterSpacing: '-0.01em', textDecoration: 'none',
        }}>
          Atlas
        </Link>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
          Mora · busca pública
        </span>
      </header>

      <div style={{ padding: '48px 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Hero */}
        <div className="paper-texture" style={{ marginBottom: 48, position: 'relative', padding: '8px 0' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.85 }}>
            <MMonogram size={64} color="var(--accent-text)" />
          </div>
          <Eyebrow num={8}>Explore</Eyebrow>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-4xl)',
            fontWeight: 400, letterSpacing: 'var(--tracking-display)', marginTop: 16, lineHeight: 1.05,
            color: 'var(--fg-primary)',
          }}>
            Mil Atlas, num só lugar.
          </h1>
          <p className="drop-cap" style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--fg-secondary)',
            maxWidth: 640, marginTop: 18, lineHeight: 1.5, fontStyle: 'italic',
          }}>
            Procure pelos catálogos públicos. Acervos, federações, cooperativas, edições — qualquer publicação que se deixe ler.
          </p>
        </div>

        {/* Search */}
        <div style={{ maxWidth: 560, marginBottom: 24, borderBottom: '2px solid var(--rule)' }}>
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon="search"
            placeholder="ex.: editora, vinhos, museu, cooperativa…"
            style={{ padding: '14px 14px 14px 40px', fontSize: 16, border: 'none', background: 'transparent' }}
          />
        </div>

        {/* Filter pills */}
        {groups.length > 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
            {groups.map(g => {
              const active = activeFilter === g
              return (
                <button
                  key={g}
                  onClick={() => setActiveFilter(g)}
                  style={{
                    background: active ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: active ? 'var(--fg-inverse)' : 'var(--fg-secondary)',
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
                    letterSpacing: '0.04em', textTransform: 'lowercase',
                    padding: '6px 12px', borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--rule)', cursor: 'pointer',
                  }}
                >
                  {g}
                </button>
              )
            })}
          </div>
        )}

        <Hairline strong my={4} />

        {/* Results */}
        <div style={{
          marginTop: 32, display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18,
        }}>
          {filtered.length === 0 ? (
            <div style={{
              gridColumn: '1 / -1', padding: '80px 24px', textAlign: 'center',
              border: '1px dashed var(--rule)', borderRadius: 'var(--radius-md)',
            }}>
              <Icon name="search" size={28} color="var(--fg-muted)" />
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16,
                color: 'var(--fg-muted)', marginTop: 14,
              }}>
                Nada encontrado por "{search}".
              </p>
            </div>
          ) : (
            filtered.map((t, i) => {
              const tone = ACCENT_TONES[i % ACCENT_TONES.length]
              const initials = t.name.slice(0, 2).toUpperCase()
              const previewRows = previews[t.name] || []
              return (
                <Link
                  key={t.id}
                  href={`/?table=${t.name}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card interactive padding={false} style={{ overflow: 'hidden', height: '100%' }}>
                    <div style={{
                      height: 90, background: tone, position: 'relative',
                      display: 'flex', alignItems: 'flex-end', padding: 14,
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontStyle: 'italic',
                        fontSize: 38, color: 'var(--fg-inverse)', lineHeight: 1, opacity: 0.92,
                      }}>
                        {initials}
                      </span>
                      <SectionNum style={{ position: 'absolute', top: 10, right: 14, color: 'var(--fg-inverse)', opacity: 0.85 }}>
                        {String(i + 1).padStart(2, '0')}
                      </SectionNum>
                    </div>
                    <div style={{ padding: 18 }}>
                      <Eyebrow style={{ marginBottom: 6 }}>
                        {t.group ? t.group : 'tabela pública'}
                      </Eyebrow>
                      <h3 style={{
                        fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)',
                        fontWeight: 400, margin: '0 0 8px', letterSpacing: '-0.005em',
                        color: 'var(--fg-primary)',
                      }}>
                        {t.name}
                      </h3>
                      {t.description && (
                        <p style={{
                          fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--fg-secondary)',
                          margin: '0 0 12px', lineHeight: 1.5, fontStyle: 'italic',
                        }}>
                          {t.description}
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                        {(t.columns || []).slice(0, 3).map(c => (
                          <Pill key={c.name} tone="muted">{c.name}</Pill>
                        ))}
                        {(t.columns?.length ?? 0) > 3 && (
                          <Pill tone="muted">+{(t.columns?.length ?? 0) - 3}</Pill>
                        )}
                      </div>
                      <div className="numeric" style={{
                        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)',
                        letterSpacing: '0.04em',
                      }}>
                        {previewRows.length > 0
                          ? `${previewRows.length} preview · ${(t.columns?.length ?? 0)} colunas`
                          : `${(t.columns?.length ?? 0)} colunas`}
                      </div>
                    </div>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
