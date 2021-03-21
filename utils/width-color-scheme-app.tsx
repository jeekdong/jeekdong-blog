import React from 'react'
import { useColorScheme } from '@/utils/hooks/useColorScheme'

const WidthColorScheme: React.FC = ({ children }) => {
  // 绑定系统 color 模式change事件
  useColorScheme()

  return (
    <>
      {children}
    </>
  )
}

export default WidthColorScheme
