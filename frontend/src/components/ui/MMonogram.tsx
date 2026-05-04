import React from 'react'

interface MMonogramProps {
  size?: number
  color?: string
  style?: React.CSSProperties
}

export default function MMonogram({ size = 24, color = 'var(--fg-primary)', style }: MMonogramProps) {
  return (
    <span
      className="glyph-m"
      style={{
        fontSize: size,
        lineHeight: 1,
        color,
        display: 'inline-block',
        ...style,
      }}
    >
      M
    </span>
  )
}
