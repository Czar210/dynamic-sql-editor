'use client'
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Density = 'compact' | 'regular' | 'loose'
export type Terminology = 'tabela' | 'colecao'
export type PersonaOverride = null | 'master' | 'admin' | 'moderator'

interface TweaksContextType {
  density: Density
  terminology: Terminology
  personaOverride: PersonaOverride
  setDensity: (d: Density) => void
  setTerminology: (t: Terminology) => void
  setPersonaOverride: (p: PersonaOverride) => void
}

const TweaksContext = createContext<TweaksContextType | null>(null)

const ROW_HEIGHT: Record<Density, string> = {
  compact: '32px',
  regular: '44px',
  loose: '56px',
}

function applyDensity(d: Density) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--row-height', ROW_HEIGHT[d])
}

export function TweaksProvider({ children }: { children: ReactNode }) {
  const [density, setDensityState] = useState<Density>('regular')
  const [terminology, setTerminologyState] = useState<Terminology>('tabela')
  const [personaOverride, setPersonaOverrideState] = useState<PersonaOverride>(null)

  useEffect(() => {
    const savedDensity = localStorage.getItem('mora-density') as Density | null
    const savedTerminology = localStorage.getItem('mora-terminology') as Terminology | null
    const savedPersona = localStorage.getItem('mora-persona-override') as PersonaOverride

    const d: Density = savedDensity && ['compact', 'regular', 'loose'].includes(savedDensity)
      ? savedDensity
      : 'regular'
    const t: Terminology = savedTerminology === 'colecao' ? 'colecao' : 'tabela'
    const p: PersonaOverride = savedPersona && ['master', 'admin', 'moderator'].includes(savedPersona)
      ? savedPersona
      : null

    setDensityState(d)
    setTerminologyState(t)
    setPersonaOverrideState(p)
    applyDensity(d)
  }, [])

  const setDensity = (d: Density) => {
    setDensityState(d)
    localStorage.setItem('mora-density', d)
    applyDensity(d)
  }

  const setTerminology = (t: Terminology) => {
    setTerminologyState(t)
    localStorage.setItem('mora-terminology', t)
  }

  const setPersonaOverride = (p: PersonaOverride) => {
    setPersonaOverrideState(p)
    if (p === null) localStorage.removeItem('mora-persona-override')
    else localStorage.setItem('mora-persona-override', p)
  }

  return (
    <TweaksContext.Provider value={{
      density, terminology, personaOverride,
      setDensity, setTerminology, setPersonaOverride,
    }}>
      {children}
    </TweaksContext.Provider>
  )
}

export function useTweaks() {
  const ctx = useContext(TweaksContext)
  if (!ctx) throw new Error('useTweaks must be used within TweaksProvider')
  return ctx
}
