'use client'
import { useState } from 'react'
import { useAuth } from '@/components/AuthContext'
import { Button, Card, Eyebrow, Hairline, Pill, SectionNum } from '@/components/ui'

type Preset = 'editorial' | 'minimalista' | 'bold'
type Tab = 'tipografia' | 'cor' | 'layout'

const PRESETS: { id: Preset; label: string; desc: string }[] = [
  { id: 'editorial',   label: 'Editorial',   desc: 'Fraunces serif, magazine layout, hairlines.' },
  { id: 'minimalista', label: 'Minimalista', desc: 'Sans clean, muito branco, sem ornamentos.' },
  { id: 'bold',        label: 'Bold',        desc: 'Display gigante, contraste alto, blocos cromáticos.' },
]

export default function PublishPage() {
  const { user } = useAuth()
  const [preset, setPreset] = useState<Preset>('editorial')
  const [tab, setTab] = useState<Tab>('tipografia')

  const slug = user?.workspace_slug || user?.username?.toLowerCase() || 'workspace'

  return (
    <div>
      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        <Eyebrow num={7}>Theme Studio · Publicar</Eyebrow>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 400,
          letterSpacing: '-0.02em', marginTop: 12, fontStyle: 'italic',
        }}>
          A capa que o mundo vê
        </h1>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', color: 'var(--fg-secondary)',
          maxWidth: 640, marginTop: 12, lineHeight: 1.5,
        }}>
          Escolha um preset, ajuste tipografia e cor. Quem visitar /{slug} vê exatamente isto — em modo só-leitura.
        </p>
      </header>

      <Hairline strong my={4} />

      <div style={{
        marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24, alignItems: 'flex-start',
      }}>
        {/* LEFT — preview */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <Eyebrow>Preview</Eyebrow>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.14em', color: 'var(--fg-muted)' }}>
              {slug}.atlas
            </span>
          </div>
          <Card padding={false} style={{ overflow: 'hidden', minHeight: 560, border: '2px solid var(--fg-primary)' }}>
            <div style={{
              padding: '40px 44px', borderBottom: '2px solid var(--fg-primary)',
              background: 'var(--bg-elevated)',
            }}>
              <Eyebrow accent style={{ marginBottom: 14 }}>edição vigente · {preset}</Eyebrow>
              <h2 style={{
                fontFamily: preset === 'minimalista' ? 'var(--font-sans)' : 'var(--font-display)',
                fontStyle: preset === 'editorial' ? 'italic' : 'normal',
                fontWeight: preset === 'bold' ? 600 : 400,
                fontSize: preset === 'bold' ? 72 : 60,
                lineHeight: 1, letterSpacing: '-0.025em', margin: 0, color: 'var(--fg-primary)',
              }}>
                {user?.workspace_name || 'Atlas Workspace'}
              </h2>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', color: 'var(--fg-secondary)',
                maxWidth: 480, marginTop: 16, lineHeight: 1.5,
              }}>
                Catálogo público — uma amostra do que será publicado em {slug}.atlas.
              </p>
            </div>

            <div style={{ padding: '28px 44px' }}>
              <Eyebrow style={{ marginBottom: 14 }}>I · Em destaque</Eyebrow>
              {[
                { n: '01', title: 'Manuscritos da margem', meta: 'Coleção · 2026' },
                { n: '02', title: 'Cartografia das ruas', meta: 'Acervo · 1.284 itens' },
                { n: '03', title: 'Vozes e silêncios', meta: 'Edição especial' },
              ].map((art, i) => (
                <article key={art.n} style={{
                  padding: '18px 0', display: 'grid', gridTemplateColumns: '60px 1fr',
                  gap: 20, alignItems: 'baseline',
                  borderTop: i === 0 ? '1px solid var(--fg-primary)' : '1px solid var(--rule-faint)',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic',
                    fontSize: 32, color: 'var(--accent-text)', lineHeight: 1,
                  }}>
                    {art.n}
                  </span>
                  <div>
                    <h4 style={{
                      fontFamily: 'var(--font-display)', fontStyle: 'italic',
                      fontSize: 22, fontWeight: 400, margin: 0, lineHeight: 1.15,
                    }}>
                      {art.title}
                    </h4>
                    <p style={{
                      fontFamily: 'var(--font-display)', fontSize: 13,
                      color: 'var(--fg-secondary)', margin: '4px 0 0',
                    }}>
                      {art.meta}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT — controls */}
        <div>
          <Eyebrow style={{ marginBottom: 12 }}>Presets</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {PRESETS.map((p, i) => (
              <Card
                key={p.id}
                interactive
                style={{
                  borderColor: preset === p.id ? 'var(--accent)' : 'var(--rule)',
                  background: preset === p.id ? 'var(--accent-subtle)' : 'var(--bg-surface)',
                  transition: 'border-color var(--duration-base) var(--ease-paper), background var(--duration-base) var(--ease-paper)',
                }}
              >
                <button
                  onClick={() => setPreset(p.id)}
                  style={{
                    background: 'transparent', border: 0, cursor: 'pointer',
                    width: '100%', textAlign: 'left', padding: 0, display: 'flex',
                    alignItems: 'flex-start', gap: 14,
                  }}
                >
                  <SectionNum>{String(i + 1).padStart(2, '0')}</SectionNum>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 400, color: 'var(--fg-primary)' }}>
                      {p.label}
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13,
                      color: 'var(--fg-secondary)', margin: '4px 0 0', lineHeight: 1.4,
                    }}>
                      {p.desc}
                    </p>
                  </div>
                  {preset === p.id && <Pill tone="accent" dot>ativo</Pill>}
                </button>
              </Card>
            ))}
          </div>

          <Hairline strong my={24} />

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--rule)' }}>
            {(['tipografia', 'cor', 'layout'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '8px 14px', background: 'transparent', cursor: 'pointer',
                  border: 0, borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
                  marginBottom: -1,
                  fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 'var(--tracking-eyebrow)',
                  textTransform: 'uppercase',
                  color: tab === t ? 'var(--accent-text)' : 'var(--fg-muted)',
                  transition: 'color var(--duration-fast) var(--ease-editorial), border-color var(--duration-base) var(--ease-editorial)',
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab content (mock) */}
          {tab === 'tipografia' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <MockControl label="Família display" value="Fraunces" />
              <MockControl label="Família body" value="IBM Plex Sans" />
              <MockControl label="Tamanho base" value="15px" />
              <MockControl label="Espaçamento" value="1.6" />
            </div>
          )}
          {tab === 'cor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <MockControl label="Acento" value="goldenrod" swatch="var(--accent)" />
              <MockControl label="Texto" value="ink-900" swatch="var(--fg-primary)" />
              <MockControl label="Fundo" value="ink-50" swatch="var(--bg-page)" />
              <MockControl label="Hairlines" value="ink-200" swatch="var(--rule)" />
            </div>
          )}
          {tab === 'layout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <MockControl label="Container" value="1200px" />
              <MockControl label="Densidade" value="regular" />
              <MockControl label="Capa" value="masthead 88px" />
            </div>
          )}

          <Hairline strong my={24} />

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button
              variant="primary"
              size="lg"
              icon="upload"
              disabled
              title="M6: em breve"
              onClick={() => alert('M6: publicação em breve')}
            >
              Publicar em {slug}.atlas
            </Button>
            <Button
              variant="secondary"
              icon="download"
              disabled
              title="M6: em breve"
              onClick={() => alert('M6: export em breve')}
            >
              Exportar pacotes
            </Button>
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 12, color: 'var(--fg-muted)', marginTop: 6, lineHeight: 1.5,
            }}>
              {/* TODO(M6): wire to backend */}
              Em breve, na M6 — publicação, presets reais e formatos de export (json, html, pdf).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MockControl({ label, value, swatch }: { label: string; value: string; swatch?: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 12px', background: 'var(--bg-elevated)',
      border: '1px solid var(--rule)', borderRadius: 'var(--radius-sm)',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
        {label}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {swatch && (
          <span style={{ width: 18, height: 18, borderRadius: 4, background: swatch, border: '1px solid var(--rule)' }} />
        )}
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-primary)' }}>
          {value}
        </span>
      </span>
    </div>
  )
}
