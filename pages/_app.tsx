import type { AppProps } from 'next/app'

import { Provider } from '@/utils/context'
import Layout from '@/components/layout'

import '@/styles/globals.css'

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
