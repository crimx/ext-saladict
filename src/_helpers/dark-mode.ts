import { DarkMode, DARK_MODE_DARK, DARK_MODE_FOLLOW } from '@/app-config'

const colorSchemeQuery = '(prefers-color-scheme: dark)'

export function isDarkMode(darkMode: DarkMode): boolean {
  return (
    darkMode === DARK_MODE_DARK ||
    (darkMode === DARK_MODE_FOLLOW && isSystemDarkMode())
  )
}

export function isSystemDarkMode(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(colorSchemeQuery).matches
  )
}

export function watchSystemDarkMode(cb: () => void): () => void {
  if (
    typeof window === 'undefined' ||
    typeof window.matchMedia !== 'function'
  ) {
    return () => {}
  }

  const media = window.matchMedia(colorSchemeQuery)

  if (typeof media.addEventListener === 'function') {
    media.addEventListener('change', cb)
    return () => media.removeEventListener('change', cb)
  }

  media.addListener(cb)
  return () => media.removeListener(cb)
}
