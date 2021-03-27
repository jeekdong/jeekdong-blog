import Head from 'next/head'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import smoothscroll from 'smoothscroll-polyfill';

import { Provider } from '@/utils/context'

import '@/styles/globals.css'

if (process.browser) {
  // scroll top polyfill
  smoothscroll.polyfill()
}

// layout 组件跟 系统本地设置主题相关，不在SSR中渲染
const Layout = dynamic(import('@/components/layout'), {
  ssr: false
})

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <Layout>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1 minimum-scale=1 user-scalable=no" />
        </Head>
        <Component {...pageProps} />
      </Layout>
    </Provider>
  )
}

export default MyApp
