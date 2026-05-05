'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import { Button, Card, Eyebrow, Hairline, Icon, OwlGlyph, Pill, SectionNum } from '@/components/ui'

type Status = 'pending' | 'loading' | 'success' | 'error'

function FakeQR({ size = 220 }: { size?: number }) {
  const cells: React.ReactElement[] = []
  const seed = (x: number, y: number) => ((x * 73 + y * 97 + x * y * 13) % 11) > 5
  for (let y = 0; y < 21; y++) {
    for (let x = 0; x < 21; x++) {
      const corner = (x < 7 && y < 7) || (x >= 14 && y < 7) || (x < 7 && y >= 14)
      const cornerEdge =
        ((x === 0 || x === 6) && y < 7) || ((y === 0 || y === 6) && x < 7) ||
        ((x === 14 || x === 20) && y < 7) || ((y === 0 || y === 6) && x >= 14) ||
        ((x === 0 || x === 6) && y >= 14) || ((y === 14 || y === 20) && x < 7)
      const cornerCenter =
        (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
        (x >= 16 && x <= 18 && y >= 2 && y <= 4) ||
        (x >= 2 && x <= 4 && y >= 16 && y <= 18)
      const fill = corner ? (cornerEdge || cornerCenter) : seed(x, y)
      if (fill) cells.push(<rect key={`${x}-${y}`} x={x * 10} y={y * 10} width="10" height="10" fill="var(--fg-primary)" />)
    }
  }
  return (
    <svg width={size} height={size} viewBox="0 0 210 210" style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: 8 }}>
      {cells}
    </svg>
  )
}

export default function QRAuthPage() {
  const { authorizeQR, token, user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const session_id = searchParams.get('session_id')

  const [status, setStatus] = useState<Status>('pending')
  const [errorMsg, setErrorMsg] = useState('')
  const [seconds, setSeconds] = useState(118)

  useEffect(() => {
    if (!token) {
      router.push(`/login?redirect=/admin/qr-auth?session_id=${session_id ?? ''}`)
    }
  }, [token, session_id, router])

  useEffect(() => {
    if (status !== 'pending') return
    const t = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [status])

  const handleAuthorize = async () => {
    if (!session_id) return
    setStatus('loading')
    const ok = await authorizeQR(session_id)
    if (ok) {
      setStatus('success')
    } else {
      setStatus('error')
      setErrorMsg('Falha ao autorizar. A sessão pode ter expirado.')
    }
  }

  if (!token) {
    return (
      <div style={{ padding: '40px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--fg-muted)' }}>
        Redirecionando para login…
      </div>
    )
  }

  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  const mnemonic = (session_id ?? 'BUDA-ZA48').slice(0, 8).toUpperCase()
  const codeDisplay = `${mnemonic.slice(0, 4)}-${mnemonic.slice(4, 8) || 'ZA48'}`

  const sessions = [
    { device: 'MacBook Pro · Chrome', where: 'São Paulo, SP', current: true, when: 'agora', icon: 'layout' as const },
    { device: 'iPhone · Safari', where: 'São Paulo, SP', current: false, when: 'há 2h', icon: 'lock' as const },
    { device: 'iPad · Atlas app', where: 'Curitiba, PR', current: false, when: 'há 4 dias', icon: 'qr' as const },
  ]

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        <Eyebrow num={11}>Autorizar dispositivo</Eyebrow>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 400,
          letterSpacing: '-0.02em', marginTop: 12, fontStyle: 'italic', color: 'var(--fg-primary)',
        }}>
          Aproxime, autorize, entre.
        </h1>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', color: 'var(--fg-secondary)',
          maxWidth: 640, marginTop: 12, lineHeight: 1.5,
        }}>
          Você está prestes a autorizar o login de outro dispositivo como{' '}
          <strong style={{ color: 'var(--fg-primary)' }}>{user?.username}</strong>.
        </p>
      </header>

      <Hairline strong my={8} />

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 32,
      }}>
        {/* QR display */}
        <Card>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
            <Eyebrow accent style={{ marginBottom: 16 }}>Código deste dispositivo</Eyebrow>

            {status === 'success' ? (
              <div style={{
                width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--ok-bg)', borderRadius: 'var(--radius-md)',
              }}>
                <Icon name="check-circle" size={64} color="var(--ok)" />
              </div>
            ) : status === 'error' ? (
              <div style={{
                width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--danger-bg)', borderRadius: 'var(--radius-md)',
              }}>
                <Icon name="x-circle" size={64} color="var(--danger)" />
              </div>
            ) : (
              <FakeQR />
            )}

            <div className="numeric" style={{
              fontFamily: 'var(--font-mono)', fontSize: 22, letterSpacing: '0.3em',
              color: 'var(--fg-primary)', marginTop: 24, fontWeight: 500,
              textTransform: 'uppercase',
            }}>
              {codeDisplay}
            </div>

            <div className="numeric" style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: 'var(--tracking-eyebrow)',
              textTransform: 'uppercase', marginTop: 12,
              color: seconds < 30 ? 'var(--danger)' : 'var(--fg-muted)',
            }}>
              expira em {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </div>

            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, width: '100%', alignItems: 'center' }}>
              {status === 'pending' && (
                <Button variant="primary" size="lg" onClick={handleAuthorize} icon="shield">
                  Autorizar acesso
                </Button>
              )}
              {status === 'loading' && (
                <Pill tone="accent" dot>processando…</Pill>
              )}
              {status === 'success' && (
                <>
                  <Pill tone="ok" dot>dispositivo autorizado</Pill>
                  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--fg-muted)', marginTop: 8 }}>
                    Você já pode fechar esta página.
                  </p>
                </>
              )}
              {status === 'error' && (
                <>
                  <Pill tone="err" dot>{errorMsg || 'erro'}</Pill>
                  <Button variant="ghost" size="sm" onClick={() => { setStatus('pending'); setSeconds(118) }}>
                    Tentar novamente
                  </Button>
                </>
              )}

              <Button variant="ghost" size="sm" onClick={() => router.push('/admin')}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>

        {/* Side: instructions + active sessions */}
        <div>
          <Eyebrow style={{ marginBottom: 12 }}>Como usar</Eyebrow>
          <ol style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', lineHeight: 1.7,
            color: 'var(--fg-secondary)', paddingLeft: 22, margin: 0,
          }}>
            <li style={{ marginBottom: 10 }}>Abra o Atlas no outro dispositivo (já logado).</li>
            <li style={{ marginBottom: 10 }}>
              Vá em <em>Conta &rarr; Autorizar dispositivo</em>.
            </li>
            <li style={{ marginBottom: 10 }}>
              Escaneie este QR <strong>ou</strong> digite o código{' '}
              <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--bg-sunken)', padding: '2px 6px', borderRadius: 'var(--radius-sm)' }}>
                {codeDisplay}
              </code>.
            </li>
            <li>Confirme o nome do dispositivo.</li>
          </ol>

          <Hairline strong my={28} />

          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <Eyebrow>Sessões ativas</Eyebrow>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-muted)', letterSpacing: '0.14em' }}>
              {/* TODO(M6): backend endpoint for active sessions */}
              mock
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sessions.map((sess, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                border: '1px solid var(--rule)', borderRadius: 'var(--radius-md)',
                background: 'var(--bg-elevated)',
              }}>
                <SectionNum>{String(i + 1).padStart(2, '0')}</SectionNum>
                <Icon name={sess.icon} size={18} color="var(--fg-secondary)" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--fg-primary)' }}>
                      {sess.device}
                    </span>
                    {sess.current && <Pill tone="ok" dot>esta</Pill>}
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', marginTop: 3 }}>
                    {sess.where} · {sess.when}
                  </div>
                </div>
                {!sess.current && <Button variant="ghost" size="sm">Encerrar</Button>}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
            <p className="numeric" style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 'var(--tracking-eyebrow)', color: 'var(--fg-muted)', textTransform: 'uppercase' }}>
              session id · {(session_id ?? '—').slice(0, 12)}
            </p>
            <OwlGlyph size={10} opacity={0.45} caption="autorize" />
          </div>
        </div>
      </div>
    </div>
  )
}
