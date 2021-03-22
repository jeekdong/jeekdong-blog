import React, { useCallback, useState } from 'react'
import { createContainer } from 'unstated-next'
import { COLOR_SCHEME_MAP, LAST_COLOR_SCHEME } from './constants'

// TODO: 更好的 context 方式
function useColorScheme() {
  const [colorScheme, setColorScheme$] = useState(COLOR_SCHEME_MAP.get('LIGHT')!)

  const setColorScheme: React.Dispatch<React.SetStateAction<string>> = useCallback(
    dispatchParams => {
      setColorScheme$(pre => {
        const value = typeof dispatchParams === 'function' ? dispatchParams(pre) : dispatchParams
        localStorage.setItem(LAST_COLOR_SCHEME, value)
        return value as typeof colorScheme
      })
    },
    []
  )

  return {
    colorScheme,
    setColorScheme
  }
}

export const ColorSchemeContainer = createContainer(useColorScheme)

export const Provider: React.FC = ({ children }) => {
  return (
    <ColorSchemeContainer.Provider>
      {children}
    </ColorSchemeContainer.Provider>
  )
}
