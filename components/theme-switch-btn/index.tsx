import React from 'react'
import Image from 'next/image'

import { COLOR_SCHEME_MAP } from '@/utils/constants'
import { ColorSchemeContainer } from '@/utils/context'

// type ExtractMap<T extends Map<any, any>> = T extends Map<any, infer R> ? R : T

// type State = ExtractMap<typeof COLOR_SCHEME_MAP>

const ThemeSwitchBtn = () => {
  const { colorScheme, setColorScheme } = ColorSchemeContainer.useContainer()

  const onThemeChange = () => {
    setColorScheme(
      pre => (
        pre === COLOR_SCHEME_MAP.get('LIGHT') 
          ? COLOR_SCHEME_MAP.get('DARK')! 
          : COLOR_SCHEME_MAP.get('LIGHT')!
      )
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={
        `focus:ring-0 focus:outline-none focus:bg-none
        w-12 h-6 rounded-2xl px-1 cursor-pointer
        inline-flex items-center transition-all duration-300
        ${colorScheme === COLOR_SCHEME_MAP.get('LIGHT') 
      ? 'bg-yellow-300 justify-end' 
      : 'bg-blue-600 justify-start'}
        `
      }
      onClick={onThemeChange}
    >
      {
        colorScheme === COLOR_SCHEME_MAP.get('LIGHT')
          ? (
            <div
              className="w-4 h-4 inline-flex justify-center items-center"
            >
              <Image
                width="20"
                height="20"
                className="w-4 h-4"
                src="/sun.svg"
                alt="moon"
              />
            </div>
          )
          : (
            <span
              className="w-4 h-4 inline-flex justify-center items-center"
            >
              <Image
                width="20"
                height="20"
                src="/moon.svg"
                alt="sun"
              />
            </span>
          )
      }
    </div>
  )
}

export default React.memo(ThemeSwitchBtn)
