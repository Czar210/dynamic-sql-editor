import React from 'react'

interface OwlGlyphProps {
  size?: number
  opacity?: number
  color?: string
  caption?: string
  style?: React.CSSProperties
}

const OWL = ` /\\___/\\
( ◉ v ◉)
 (     )
 _)   (_
  \\___/`

export default function OwlGlyph({
  size = 11,
  opacity = 0.5,
  color = 'var(--fg-faint, var(--fg-muted))',
  caption,
  style,
}: OwlGlyphProps) {
  return (
    <pre
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: size,
        lineHeight: 1.3,
        color,
        opacity,
        margin: 0,
        whiteSpace: 'pre',
        userSelect: 'none',
        pointerEvents: 'none',
        ...style,
      }}
    >
      {caption ? `${OWL}\n\n  ${caption}` : OWL}
    </pre>
  )
}
