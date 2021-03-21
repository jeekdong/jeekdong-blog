import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { prism, xonokai } from 'react-syntax-highlighter/dist/cjs/styles/prism'

import { COLOR_SCHEME_MAP } from '@/utils/constants'
import { ColorSchemeContainer } from '@/utils/context'

interface Props {
  value: string;
  language: string;
}

const CodeBlock = ({ value, language }: Props) => {
  const { colorScheme } = ColorSchemeContainer.useContainer()

  return (
    <SyntaxHighlighter
      language={language} 
      style={colorScheme === COLOR_SCHEME_MAP.get('LIGHT') ? prism : xonokai}
    >
      {value}
    </SyntaxHighlighter>
  )
}

export default React.memo(CodeBlock)
