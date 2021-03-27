import React, { useEffect } from 'react'
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
  
  return (
    <div className={`${colorScheme}`}>
      {/* TODO: 背景颜色设置到body，防止滚动看到底色 */}
      <div 
        className="pb-4 pt-8 max-w-full md:max-w-2xl md:m-auto xl:m-auto xl:max-w-3x"
      >
        {children}
      </div>
    </div>
  )
}

export default Layout
