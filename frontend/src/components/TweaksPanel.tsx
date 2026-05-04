'use client'
import { useEffect, useState } from 'react'
import { useTheme, type Accent, type Mode } from '@/components/ThemeContext'
import { useTweaks, type Density, type PersonaOverride, type Terminology } from '@/contexts/TweaksContext'
import { Eyebrow, Hairline, Icon } from '@/components/ui'

const ACCENTS: { id: Accent; color: string }[] = [
  { id: 'goldenrod', color: '#DAA63E' },
  { id: 'sage',      color: '#95A581' },
  { id: 'ruby',      color: '#852E47' },
  { id: 'nectar',    color: '#C2441C' },
]

export default function TweaksPanel() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [enabledInProd, setEnabledInProd] = useState(false)
  const { density, terminology, personaOverride, setDensity, setTerminology, setPersonaOverride } = useTweaks()
  const { accent, mode, setAccent, setMode } = useTheme()

  useEffect(() => {
    setMounted(true)
    setEnabledInProd(typeof window !== 'undefined' && localStorage.getItem('mora-tweaks-enabled') === '1')
  }, [])

  if (!mounted) return null

  const isDev = process.env.NODE_ENV === 'development'
  const showButton = isDev || enabledInProd
  if (!showButton) return null

  const showPersona = isDev || enabledInProd

  return (
    <>
      {/* Floating button (bottom-left) */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Tweaks"
        aria-label="Open tweaks panel"
        style={{
          position: 'fixed', bottom: 20, left: 20, zIndex: 60,
          width: 40, height: 40, borderRadius: 'var(--radius-full)',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--rule)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--fg-secondary)',
        }}
      >
        <Icon name="settings" size={16} />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 70,
          }}
        />
      )}

      {/* Drawer */}
      <aside
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: 360, maxWidth: '100vw', zIndex: 71,
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--rule)',
          boxShadow: 'var(--shadow-lg)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.2s cubic-bezier(.3,.7,.4,1)',
          overflowY: 'auto',
          padding: 24,
          color: 'var(--fg-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
          <Eyebrow>Tweaks · sessão</Eyebrow>
          <button
            onClick={() => setOpen(false)}
            style={{ background: 'transparent', border: 0, cursor: 'pointer', color: 'var(--fg-muted)', padding: 4, display: 'flex' }}
            aria-label="Close"
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        <h2 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)',
          fontWeight: 400, margin: 0, fontStyle: 'italic',
        }}>
          Ajustes finos
        </h2>
        <p style={{
          fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13,
          color: 'var(--fg-muted)', margin: '8px 0 20px', lineHeight: 1.5,
        }}>
          Preferências locais — só desta sessão e deste dispositivo.
        </p>

        {/* Persona override (DEV only) */}
        {showPersona && (
          <Section label="Persona override · dev">
            <Segmented<PersonaOverride>
              options={[
                { value: null, label: 'real' },
                { value: 'master', label: 'master' },
                { value: 'admin', label: 'admin' },
                { value: 'moderator', label: 'mod' },
              ]}
              value={personaOverride}
              onChange={setPersonaOverride}
            />
            <Hint>
              Não troca seu token — só simula o role pra UI testar variantes.
            </Hint>
          </Section>
        )}

        <Section label="Densidade do data grid">
          <Segmented<Density>
            options={[
              { value: 'compact', label: 'compacto' },
              { value: 'regular', label: 'regular' },
              { value: 'loose', label: 'folgado' },
            ]}
            value={density}
            onChange={setDensity}
          />
          <Hint>row-height: <code>var(--row-height)</code></Hint>
        </Section>

        <Section label="Terminologia">
          <Segmented<Terminology>
            options={[
              { value: 'tabela', label: 'tabela' },
              { value: 'colecao', label: 'coleção' },
            ]}
            value={terminology}
            onChange={setTerminology}
          />
          <Hint>Usado em copy ao longo do app.</Hint>
        </Section>

        <Section label="Tema">
          <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            {ACCENTS.map(a => {
              const active = accent === a.id
              return (
                <button
                  key={a.id}
                  onClick={() => setAccent(a.id)}
                  title={a.id}
                  aria-label={`Accent ${a.id}`}
                  style={{
                    width: 32, height: 32, borderRadius: 'var(--radius-full)',
                    background: a.color, cursor: 'pointer',
                    border: `2px solid ${active ? 'var(--fg-primary)' : 'transparent'}`,
                    outline: '1px solid var(--rule)', outlineOffset: 0,
                  }}
                />
              )
            })}
          </div>
          <Segmented<Mode>
            options={[
              { value: 'light', label: 'claro' },
              { value: 'dark', label: 'escuro' },
            ]}
            value={mode}
            onChange={setMode}
          />
        </Section>
      </aside>
    </>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <Eyebrow style={{ marginBottom: 10 }}>{label}</Eyebrow>
      {children}
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.04em',
      color: 'var(--fg-muted)', marginTop: 8, lineHeight: 1.5,
    }}>
      {children}
    </p>
  )
}

interface SegmentedProps<T> {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
}

function Segmented<T>({ options, value, onChange }: SegmentedProps<T>) {
  return (
    <div style={{
      display: 'inline-flex', padding: 2, borderRadius: 'var(--radius-md)',
      background: 'var(--bg-sunken)', border: '1px solid var(--rule)', width: '100%',
    }}>
      {options.map(opt => {
        const active = value === opt.value
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            style={{
              flex: 1, padding: '6px 10px', cursor: 'pointer',
              background: active ? 'var(--bg-elevated)' : 'transparent',
              color: active ? 'var(--fg-primary)' : 'var(--fg-muted)',
              border: 0, borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 500,
              letterSpacing: '0.04em', textTransform: 'lowercase',
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
              transition: 'background 0.15s',
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
