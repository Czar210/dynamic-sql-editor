"use client"
import Link from 'next/link'
import { ArrowRight, Database, Layout, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'


export default function Home() {
  const [dataModel, setDataModel] = useState<any>(null)

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/posts`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setDataModel(data[0])
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center bg-[#0a0a12] text-white">
      {/* Background gradients */}
      <div className="absolute top-0 -left-1/4 w-[150%] h-[500px] bg-indigo-500/15 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-blue-500/8 rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Mora owl — top-left corner */}
      <div className="fixed top-4 left-5 select-none pointer-events-none z-20">
        <pre className="text-xs font-mono leading-tight text-neutral-600">{`  /\\   /\\
 ( ◉ v ◉)
  (      )
 __)    (__
    \\__/`}</pre>
      </div>

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="font-bold text-xl tracking-tight pl-28 bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
          Atlas
        </div>
        <nav className="flex items-center gap-6">
          <Link href="/admin" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Painel Admin</Link>
          <Link href="/explore" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Explorador</Link>
          <Link href="/login" className="px-4 py-2 bg-white text-black font-semibold rounded-full text-sm hover:bg-neutral-200 transition-colors">
            Entrar
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 flex flex-col justify-center py-20 z-10">
        <div className="max-w-4xl text-center mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">

          {/* Badge — topo */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-neutral-800 bg-neutral-900/50 text-sm text-neutral-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Open Source · Mora Org
          </div>

          {/* Botões — logo abaixo do badge */}
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full font-medium transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Entrar no Painel
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://github.com/Mora-Org/Atlas"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white rounded-full font-medium transition-all hover:scale-105 active:scale-95"
            >
              Ver no GitHub
            </a>
          </div>

          {/* Atlas — prata */}
          <h1
            className="text-[clamp(5rem,18vw,14rem)] font-bold tracking-tighter leading-none select-none"
            style={{
              background: 'linear-gradient(160deg, #ffffff 0%, #c0c0c0 30%, #8a8a8a 60%, #404040 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Atlas
          </h1>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-neutral-500 -mt-2">
            O painel que respeita o seu tempo.
          </p>

          <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Headless CMS open-source para criar painéis administrativos com tabelas dinâmicas, CRUD visual e dashboards interativos — sem burocracia.
          </p>

        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 max-w-5xl mx-auto">
          {[
            {
              icon: Database,
              title: "Tabelas Dinâmicas",
              desc: "Defina colunas em tempo real. O Atlas gera o schema, o CRUD e a interface automaticamente."
            },
            {
              icon: Shield,
              title: "3 Níveis de Acesso",
              desc: "Hierarquia master → admin → moderador com grupos e permissões granulares por tabela."
            },
            {
              icon: Layout,
              title: "Interface sem Ruído",
              desc: "Next.js App Router + TailwindCSS. 4 temas, 6 cores. Foco no que importa, não na configuração."
            }
          ].map((feat, i) => (
            <div key={i} className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-sm hover:bg-neutral-800/50 transition-colors">
              <feat.icon className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
              <p className="text-neutral-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>

        {dataModel && (
          <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur-md max-w-3xl mx-auto text-center animate-in zoom-in duration-700">
            <p className="text-2xl font-medium text-white max-w-xl mx-auto mb-2">
              "{dataModel.title || dataModel.name || dataModel.content || 'Dados carregados com sucesso'}"
            </p>
            <p className="text-neutral-400 text-sm">Dados ao vivo do seu banco de dados.</p>
          </div>
        )}
      </main>

      {/* Manifesto section */}
      <section className="w-full border-t border-neutral-800/60 bg-neutral-950/60">
        <div className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-2 gap-20">

          {/* Atlas */}
          <div className="space-y-6">
            <p className="text-xs font-mono tracking-widest text-neutral-600 uppercase">Atlas</p>
            <h2 className="text-3xl font-bold text-white leading-snug">
              Um painel que sai<br />do seu caminho.
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              Atlas nasceu de uma frustração real: painéis administrativos que deveriam acelerar o trabalho se tornam o trabalho em si — formulários intermináveis, configurações de banco de dados repetitivas, horas gastas em boilerplate que não entrega valor.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              A proposta é outra. Você define a estrutura dos seus dados uma vez e o Atlas gera o schema, o CRUD, os filtros e a interface. O tempo que sobra é seu — pra pensar no produto, não na infraestrutura.
            </p>
            <p className="text-neutral-500 text-sm leading-relaxed italic">
              "A Engenharia como Escudo — software que remove o peso da burocracia para que você foque no que importa."
            </p>
          </div>

          {/* Mora */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <pre className="text-xs font-mono leading-tight text-neutral-700">{`  /\\   /\\
 ( ◉ v ◉)
  (      )
 __)    (__
    \\__/`}</pre>
              <p className="text-xs font-mono tracking-widest text-neutral-600 uppercase">Mora Org</p>
            </div>
            <h2 className="text-3xl font-bold text-white leading-snug">
              A pausa necessária<br />para a profundidade.
            </h2>
            <p className="text-neutral-400 leading-relaxed">
              <em>Mora</em> vem do latim: pausa ou demora. Não uma interrupção vazia, mas o tempo necessário para que algo denso possa ser construído com cuidado. A Mora existe como organização porque acreditamos que software de qualidade não nasce de sprints desumanizantes — nasce de autonomia, domínio e intenção.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              Atlas é o primeiro projeto público da Mora. Open-source porque entendemos que uma ideia entregue permanece no mundo, disponível para que outra pessoa a evolua no seu próprio momento.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                'Sem crunch',
                'Sem microgestão',
                'Open source',
                'Feito com intenção',
              ].map(v => (
                <div key={v} className="flex items-center gap-2 text-sm text-neutral-500">
                  <span className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />
                  {v}
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="border-t border-neutral-800/40 py-8 px-6 text-center space-y-2">
          <p className="text-sm text-neutral-400">
            Sinta-se livre para criar seu fork — seguimos as convenções da licença{' '}
            <a
              href="https://www.apache.org/licenses/LICENSE-2.0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-300 hover:text-white underline underline-offset-2 transition-colors"
            >
              Apache 2.0
            </a>.
          </p>
          <p className="text-xs text-neutral-700 font-mono">Mora Org · Atlas · Open Source com alma</p>
        </div>
      </section>
    </div>
  )
}
