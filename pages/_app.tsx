import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'

import { Provider } from '@/utils/context'

import '@/styles/globals.css'

// layout 组件跟 系统本地设置主题相关，不在SSR中渲染
const Layout = dynamic(import('@/components/layout'), {
  ssr: false
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  )
}

export default MyApp
