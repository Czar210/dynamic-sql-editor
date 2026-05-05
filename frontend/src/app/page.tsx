'use client'

import Link from 'next/link'
import { Button, Eyebrow, Hairline, Icon, MMonogram, OwlGlyph, Pill, SectionNum } from '@/components/ui'

const PILLARS = [
  {
    num: '01',
    icon: 'database' as const,
    title: 'Tabelas dinâmicas',
    desc: 'Você define colunas em tempo real. O Atlas gera o schema, o CRUD e a interface — sem boilerplate.',
  },
  {
    num: '02',
    icon: 'shield' as const,
    title: 'Três níveis de acesso',
    desc: 'Hierarquia master → admin → moderador, com grupos e permissões granulares por tabela.',
  },
  {
    num: '03',
    icon: 'layout' as const,
    title: 'Interface sem ruído',
    desc: 'Next.js + Fraunces + IBM Plex. Quatro acentos, dois modos. Foco no conteúdo, não no chrome.',
  },
]

const VIRTUES = ['Sem crunch', 'Sem microgestão', 'Open source', 'Feito com intenção']

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-page)', color: 'var(--fg-primary)' }}>

      <header
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MMonogram size={28} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 400 }}>Atlas</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: 'var(--tracking-eyebrow)',
              textTransform: 'uppercase',
              color: 'var(--fg-muted)',
            }}
          >
            Mora · v.1
          </span>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link href="/admin" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-secondary)', textDecoration: 'none' }}>
            Painel
          </Link>
          <Link href="/explore" style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--fg-secondary)', textDecoration: 'none' }}>
            Explorar
          </Link>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="sm">Entrar</Button>
          </Link>
        </nav>
      </header>

      <Hairline strong my={0} />

      <main className="paper-texture" style={{ position: 'relative' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 32px 80px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80, alignItems: 'center' }}>

          <div>
            <Eyebrow accent style={{ marginBottom: 22 }}>
              Volume 1 · Edição inaugural · Open Source
            </Eyebrow>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontWeight: 400,
                fontSize: 'clamp(72px, 11vw, 144px)',
                lineHeight: 0.92,
                letterSpacing: 'var(--tracking-display)',
                margin: '0 0 28px',
                fontVariationSettings: '"opsz" 144, "SOFT" 80',
                textWrap: 'balance',
              }}
            >
              Atlas.
            </h1>
            <p
              className="drop-cap"
              style={{
                fontFamily: 'var(--font-display)',
                fontStyle: 'italic',
                fontSize: 22,
                lineHeight: 1.5,
                color: 'var(--fg-secondary)',
                maxWidth: 540,
                margin: '0 0 36px',
                textWrap: 'pretty',
              }}
            >
              Um painel administrativo que respeita o seu tempo. Bancos de dados que se leem como uma revista — para curadores que nunca tocaram em SQL e administradores que vivem nele.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <Link href="/login" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg" iconRight="arrow-right">
                  Entrar no painel
                </Button>
              </Link>
              <a href="https://github.com/Mora-Org/Atlas" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <Button variant="secondary" size="lg" iconRight="external-link">
                  Ver no GitHub
                </Button>
              </a>
            </div>
          </div>

          <aside
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 24,
              borderLeft: '1px solid var(--rule)',
              paddingLeft: 48,
            }}
          >
            <Pill tone="ok" dot>
              Open Source · Mora Org
            </Pill>
            <OwlGlyph size={13} opacity={0.55} caption="mora" />
            <span
              className="vertical-text"
              style={{ marginTop: 20, color: 'var(--fg-muted)' }}
            >
              Edição contínua · Apache 2.0
            </span>
          </aside>

        </div>
      </main>

      <Hairline strong my={0} />

      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 32px' }}>
        <Eyebrow accent style={{ marginBottom: 18 }}>
          Três pilares
        </Eyebrow>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.05, letterSpacing: 'var(--tracking-h1)', margin: '0 0 64px', maxWidth: 720 }}>
          O que o Atlas entrega.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          {PILLARS.map(p => (
            <article key={p.num} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <SectionNum>{p.num}</SectionNum>
                <Icon name={p.icon} size={20} color="var(--accent-text)" />
              </div>
              <Hairline />
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 24, lineHeight: 1.2, letterSpacing: 'var(--tracking-tight)', margin: 0 }}>
                {p.title}
              </h3>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, lineHeight: 1.65, color: 'var(--fg-secondary)', margin: 0 }}>
                {p.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--rule)', borderBottom: '1px solid var(--rule)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '96px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 96 }}>

          <div>
            <Eyebrow num="04" accent style={{ marginBottom: 18 }}>Atlas</Eyebrow>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 36, lineHeight: 1.2, letterSpacing: 'var(--tracking-h2)', margin: '0 0 24px', textWrap: 'balance' }}>
              Um painel que sai do seu caminho.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--fg-secondary)', margin: '0 0 16px' }}>
              Nasceu de uma frustração real: painéis administrativos que deveriam acelerar o trabalho se tornam o trabalho em si — formulários intermináveis, configurações repetitivas, horas em boilerplate que não entrega valor.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--fg-secondary)', margin: 0 }}>
              A proposta é outra. Você define a estrutura uma vez e o Atlas gera o schema, o CRUD, os filtros e a interface. O tempo que sobra é seu — pra pensar no produto, não na infraestrutura.
            </p>
            <p className="editorial-quote" style={{ marginTop: 36, fontSize: 22 }}>
              &ldquo;A engenharia como escudo — software que remove o peso da burocracia para que você foque no que importa.&rdquo;
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 18 }}>
              <OwlGlyph size={11} opacity={0.6} />
              <Eyebrow num="05" accent>Mora Org</Eyebrow>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 36, lineHeight: 1.2, letterSpacing: 'var(--tracking-h2)', margin: '0 0 24px', textWrap: 'balance' }}>
              A pausa necessária para a profundidade.
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--fg-secondary)', margin: '0 0 16px' }}>
              <em style={{ fontFamily: 'var(--font-display)' }}>Mora</em> vem do latim: pausa ou demora. Não uma interrupção vazia, mas o tempo necessário para que algo denso possa ser construído com cuidado. Software de qualidade não nasce de sprints desumanizantes — nasce de autonomia, domínio e intenção.
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--fg-secondary)', margin: '0 0 32px' }}>
              Atlas é o primeiro projeto público da Mora. Open-source porque uma ideia entregue permanece no mundo, disponível para outra pessoa evoluir no seu próprio momento.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {VIRTUES.map(v => (
                <div key={v} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--fg-muted)' }}>
                  <span style={{ width: 4, height: 4, borderRadius: 999, background: 'var(--accent)', flexShrink: 0 }} />
                  {v}
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      <footer style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <p style={{ fontSize: 13, color: 'var(--fg-muted)', margin: 0 }}>
          Sob{' '}
          <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noopener noreferrer">
            Apache 2.0
          </a>
          . Faça seu fork.
        </p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-muted)', letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', margin: 0 }}>
          Mora Org · Atlas · Open Source com alma
        </p>
      </footer>

    </div>
  )
}
