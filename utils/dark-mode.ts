import { LAST_COLOR_SCHEME, COLOR_SCHEME_MAP } from './constants'

export function getColorScheme() {
  if (process.browser) {
    let result = localStorage.getItem(LAST_COLOR_SCHEME)
    if (!result) {
      result = COLOR_SCHEME_MAP.get('LIGHT')!
      localStorage.setItem(LAST_COLOR_SCHEME, COLOR_SCHEME_MAP.get('LIGHT')!)
    }
    return result
  }
  return COLOR_SCHEME_MAP.get('LIGHT')!
}
