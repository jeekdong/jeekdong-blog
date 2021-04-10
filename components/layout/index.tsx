import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'

import { usePrevious } from 'nw-hooks'

import { useColorScheme } from '@/utils/hooks/useColorScheme'
import { ColorSchemeContainer } from '@/utils/context'

const Layout: React.FC = ({ children }) => {
  // 绑定系统 color 模式change事件
  useColorScheme()

  const { colorScheme } = ColorSchemeContainer.useContainer()

  const preColorScheme = usePrevious(colorScheme)

  useEffect(() => {
    let ele = document.documentElement
    ele.classList.remove(preColorScheme)
    ele.classList.add(colorScheme)
  }, [preColorScheme, colorScheme])

  const router = useRouter()

  const isIndex = useMemo(() => (
    router.pathname === '/'
  ), [router])
  
  
  return (
    <div className={`${colorScheme}`}>
      {/* TODO: 背景颜色设置到body，防止滚动看到底色 */}
      <div 
        className={`
          ${isIndex
      ? 'pb-4 pt-8 max-w-full m-auto md:max-w-3xl'
      : 'pb-4 pt-8 md:px-16 max-w-full m-auto xl:max-w-7xl'}
      `}
      >
        {children}
      </div>
    </div>
  )
}

export default Layout
