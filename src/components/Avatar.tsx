import { useState } from 'react'

interface AvatarProps {
  src: string
  alt: string
  size?: 'sm' | 'md'
}

export function Avatar({ src, alt, size = 'sm' }: AvatarProps) {
  const [failed, setFailed] = useState(false)
  const dimension = size === 'sm' ? 'h-8 w-8 text-[11px]' : 'h-11 w-11 text-sm'
  if (failed || !src) {
    return (
      <span className={`${dimension} inline-flex shrink-0 items-center justify-center rounded-full border border-gold/30 bg-abyssSoft font-semibold text-gold/80`}>
        {alt.slice(0, 2).toUpperCase()}
      </span>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${dimension} shrink-0 rounded-full border border-gold/30 bg-abyssSoft object-cover`}
    />
  )
}
