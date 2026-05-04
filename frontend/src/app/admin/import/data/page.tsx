'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthContext'
import { Button, Card, Eyebrow, Field, Hairline, Icon, Pill, SectionNum, Select } from '@/components/ui'

type Step = 'upload' | 'preview' | 'done'
type Result = {
  inserted_rows?: number
  total_rows?: number
  matched_columns?: string[]
  unmatched_columns?: string[]
  errors?: string[]
}

type TableMeta = { id: number; name: string; columns?: { name: string }[] }

export default function ImportDataPage() {
  const { token } = useAuth()
  const [tables, setTables] = useState<TableMeta[]>([])
  const [selectedTable, setSelectedTable] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [step, setStep] = useState<Step>('upload')
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetch(`${API}/tables/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then((d) => setTables(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [API, token])

  const targetCols = tables.find(t => t.name === selectedTable)?.columns || []

  const goPreview = () => {
    if (!file || !selectedTable) return
    setStep('preview')
  }

  const handleUpload = async () => {
    if (!file || !selectedTable) return
    setLoading(true)
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch(`${API}/api/import/data/${selectedTable}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      setResult(data)
      setStep('done')
    } catch (e) {
      setResult({ errors: [(e as Error).message] })
      setStep('done')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setFile(null); setSelectedTable(''); setResult(null); setStep('upload')
  }

  return (
    <div style={{ maxWidth: 880 }}>
      {/* Header */}
      <header style={{ marginBottom: 32 }}>
        <Eyebrow num="5b">Importar planilha</Eyebrow>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 400,
          letterSpacing: '-0.02em', marginTop: 12, fontStyle: 'italic',
        }}>
          A partir de uma planilha
        </h1>
        <p style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-md)', color: 'var(--fg-secondary)',
          maxWidth: 640, marginTop: 12, lineHeight: 1.5,
        }}>
          Excel ou CSV. Atlas adivinha tipos, sugere relações e mostra o mapa antes de gravar.
        </p>
      </header>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        {(['upload', 'preview', 'done'] as Step[]).map((s, i) => {
          const active = step === s
          const done = (['upload', 'preview', 'done'] as Step[]).indexOf(step) > i
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 'var(--radius-full)',
                background: active ? 'var(--accent)' : done ? 'var(--accent-subtle)' : 'var(--bg-elevated)',
                color: active ? 'var(--fg-inverse)' : done ? 'var(--accent-text)' : 'var(--fg-muted)',
                border: '1px solid var(--rule)',
                fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em',
              }}>
                <SectionNum style={{ color: 'inherit' }}>{`0${i + 1}`}</SectionNum>
                {s === 'upload' ? 'origem' : s === 'preview' ? 'mapa' : 'resultado'}
              </div>
              {i < 2 && <Icon name="chevron_right" size={14} color="var(--fg-muted)" />}
            </div>
          )
        })}
      </div>

      <Hairline strong my={4} />

      {/* STEP 1 */}
      {step === 'upload' && (
        <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <Card>
            <Eyebrow style={{ marginBottom: 12 }}>Tabela destino</Eyebrow>
            <Field label="Onde gravar">
              <Select value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
                <option value="">— escolha uma tabela —</option>
                {tables.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </Select>
            </Field>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--fg-muted)', marginTop: 12 }}>
              As colunas da planilha são casadas pelo nome com as colunas existentes desta tabela.
            </p>
          </Card>

          <Card>
            <Eyebrow style={{ marginBottom: 12 }}>Arquivo</Eyebrow>
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f) }}
              onClick={() => document.getElementById('sheet-file')?.click()}
              style={{
                border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--rule)'}`,
                background: dragOver ? 'var(--accent-subtle)' : 'var(--bg-sunken)',
                borderRadius: 'var(--radius-md)', padding: '32px 16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer',
              }}
            >
              <Icon name="upload" size={32} color="var(--fg-muted)" />
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-muted)', textAlign: 'center' }}>
                {file ? file.name : 'arraste · csv · xlsx'}
              </p>
              <input
                id="sheet-file" type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }}
                onChange={e => { if (e.target.files?.[0]) setFile(e.target.files[0]) }}
              />
            </div>
          </Card>

          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
            <Button variant="primary" size="lg" icon="arrow-right" onClick={goPreview}
              disabled={!file || !selectedTable}>
              Próximo · ver mapa
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 'preview' && file && (
        <div style={{ marginTop: 28 }}>
          <Card>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              {[
                ['arquivo', file.name],
                ['tamanho', `${Math.round(file.size / 1024)} KB`],
                ['destino', selectedTable],
                ['colunas alvo', String(targetCols.length || '?')],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <Eyebrow style={{ marginBottom: 6 }}>{k}</Eyebrow>
                  <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Eyebrow style={{ marginTop: 28, marginBottom: 12 }}>Colunas detectadas no destino</Eyebrow>
          <Card padding={false}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 120px',
              padding: '10px 18px', background: 'var(--bg-sunken)',
              borderBottom: '1px solid var(--rule)',
            }}>
              <Eyebrow style={{ fontSize: 9 }}>Coluna</Eyebrow>
              <Eyebrow style={{ fontSize: 9 }}>Status</Eyebrow>
            </div>
            {targetCols.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--fg-muted)' }}>
                Mapeamento real só após o upload — Atlas casa pelos cabeçalhos.
              </div>
            ) : targetCols.map(c => (
              <div key={c.name} style={{
                display: 'grid', gridTemplateColumns: '1fr 120px', padding: '12px 18px',
                borderBottom: '1px solid var(--rule-faint)', alignItems: 'center',
              }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-primary)' }}>
                  {c.name}
                </span>
                <Pill tone="muted">aguardando</Pill>
              </div>
            ))}
          </Card>

          <div style={{ display: 'flex', gap: 8, marginTop: 24, justifyContent: 'flex-end' }}>
            <Button variant="ghost" onClick={() => setStep('upload')}>Voltar</Button>
            <Button variant="primary" size="lg" icon="check" disabled={loading} onClick={handleUpload}>
              {loading ? 'Importando…' : `Importar para ${selectedTable}`}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 'done' && result && (
        <div style={{ marginTop: 28 }}>
          <Card>
            <Eyebrow style={{ marginBottom: 16 }}>Resultado</Eyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              <Stat label="linhas inseridas" n={String(result.inserted_rows ?? 0)} tone="ok" />
              <Stat label="colunas casadas" n={String(result.matched_columns?.length ?? 0)} tone="accent" />
              <Stat label="erros" n={String(result.errors?.length ?? 0)} tone={result.errors?.length ? 'err' : 'muted'} />
            </div>

            {result.matched_columns && result.matched_columns.length > 0 && (
              <>
                <Hairline my={20} />
                <Eyebrow style={{ marginBottom: 8 }}>Casadas</Eyebrow>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.matched_columns.map(c => <Pill key={c} tone="ok" dot>{c}</Pill>)}
                </div>
              </>
            )}

            {result.errors && result.errors.length > 0 && (
              <>
                <Hairline my={20} />
                <Eyebrow style={{ marginBottom: 8 }}>Erros</Eyebrow>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {result.errors.map((e, i) => (
                    <div key={i} style={{
                      fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--danger)',
                      padding: 10, background: 'var(--danger-bg)', borderRadius: 'var(--radius-sm)',
                    }}>
                      {e}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>

          <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
            <Button variant="primary" icon="upload" onClick={reset}>Importar mais</Button>
            <Button variant="ghost" icon="table" onClick={() => location.assign('/admin/tables')}>Ir pra tabelas</Button>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, n, tone }: { label: string; n: string; tone: 'ok' | 'accent' | 'err' | 'muted' }) {
  const colorMap: Record<string, string> = {
    ok: 'var(--ok)', accent: 'var(--accent-text)', err: 'var(--danger)', muted: 'var(--fg-muted)',
  }
  const bgMap: Record<string, string> = {
    ok: 'var(--ok-bg)', accent: 'var(--accent-bg)', err: 'var(--danger-bg)', muted: 'var(--bg-sunken)',
  }
  return (
    <div style={{
      padding: 16, borderRadius: 'var(--radius-md)',
      background: bgMap[tone], border: '1px solid var(--rule-faint)',
    }}>
      <div className="numeric" style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: colorMap[tone], lineHeight: 1 }}>
        {n}
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 'var(--tracking-eyebrow)', textTransform: 'uppercase', color: 'var(--fg-muted)', marginTop: 6 }}>
        {label}
      </div>
    </div>
  )
}
