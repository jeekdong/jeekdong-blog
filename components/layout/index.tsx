import React from 'react'

import { useColorScheme } from '@/utils/hooks/useColorScheme'
import { ColorSchemeContainer } from '@/utils/context'

const Layout: React.FC = ({ children }) => {
  // 绑定系统 color 模式change事件
  useColorScheme()

  const { colorScheme } = ColorSchemeContainer.useContainer()
  
  return (
    <div className={`${colorScheme}`}>
      {/* 这里多一个 tag 设置 dark，防止margin导致 bg 不生效 */}
      <div className="dark:bg-gray-800 dark:text-white min-h-screen">
        <div 
          className="pb-4 pt-8 max-w-full md:max-w-2xl md:m-auto xl:m-auto xl:max-w-3x"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default Layout
