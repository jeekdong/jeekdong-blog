import { useCallback, useEffect } from 'react'
import { getColorScheme } from '@/utils/dark-mode'
import { ColorSchemeContainer } from '../context'
import { COLOR_SCHEME_MAP } from '../constants'

export function useColorScheme() {
  const { colorScheme, setColorScheme } = ColorSchemeContainer.useContainer()
  
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

  const checkColorSchemeRight = useCallback(() => {
    if (process.browser) {
      const localColorScheme = getColorScheme()
      if (localColorScheme && localColorScheme !== colorScheme) {
        setColorScheme(localColorScheme)
      }
    }
  }, [setColorScheme, colorScheme])

  // TODO: 每次color变化都会执行一次，实际我们只想第一次的时候执行
  useEffect(() => {
    checkColorSchemeRight()
  }, [checkColorSchemeRight])
}
