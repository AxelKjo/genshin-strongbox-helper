import { useEffect, useRef, useState } from 'react'
import { Info } from 'lucide-react'
import type { Lang } from '../lib/i18n'
import { t } from '../lib/i18n'

interface CriteriaPopoverProps {
  lang: Lang
}

export function CriteriaPopover({ lang }: CriteriaPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [isOpen])

  return (
    <div
      ref={containerRef}
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={t('criteria', lang)}
        className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-xs font-semibold text-goldSoft transition hover:border-gold/50 hover:bg-gold/20 hover:text-gold focus:outline-none focus:ring-1 focus:ring-gold/40 cursor-help"
      >
        <Info className="h-3.5 w-3.5 text-gold" aria-hidden />
        <span>{t('criteria', lang)}</span>
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute left-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-gold/25 bg-abyssCard/95 p-4 text-xs leading-relaxed text-slate-200 shadow-2xl backdrop-blur-md sm:w-96"
        >
          <div className="space-y-2.5">
            <p>{t('criteriaP1', lang)}</p>
            <p className="text-slate-300">{t('criteriaP2', lang)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
