export const HOME_TITLE = "jeekdong's Blog"

export const AUTHOR = 'Jeekdong'

export const LAST_COLOR_SCHEME = 'last_color_scheme'

export const IS_BROWSER = !!process.browser

export const CLIENT_HEIGHT = IS_BROWSER 
  ? document.documentElement.clientHeight || document.body.clientHeight 
  : 0

export const COLOR_SCHEME_MAP = new Map<'LIGHT' | 'DARK', 'light' | 'dark'>([
  ['LIGHT', 'light'],
  ['DARK', 'dark']
])
