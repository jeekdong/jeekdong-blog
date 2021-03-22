import { useCallback, useEffect } from 'react'
import { ColorSchemeContainer } from '../context'
import { COLOR_SCHEME_MAP } from '../constants'

export function useColorScheme() {
  const { setColorScheme } = ColorSchemeContainer.useContainer()
  
  // TODO: 这里有每次color变化，重新绑定事件的问题
  const callback = useCallback((e: MediaQueryListEvent) => {
    let prefersDarkMode = e.matches;
    if (prefersDarkMode) {
      setColorScheme(COLOR_SCHEME_MAP.get('DARK')!)
    } else {
      setColorScheme(COLOR_SCHEME_MAP.get('LIGHT')!)
    }
  }, [setColorScheme])

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', callback)
    } else if (typeof media.addListener === 'function') {
      media.addListener(callback)
    }
    return () => {
      if (typeof media.addEventListener === 'function') {
        media.removeEventListener('change', callback)
      } else if (typeof media.addListener === 'function') {
        media.removeListener(callback)
      }
    }
  }, [callback])
}
