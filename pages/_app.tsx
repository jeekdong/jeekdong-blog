import type { AppProps } from 'next/app'

import { Provider } from '@/utils/context'
import WidthColorScheme from '@/utils/width-color-scheme-app'

import '@/styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <WidthColorScheme>
        <Component {...pageProps} />
      </WidthColorScheme>
    </Provider>
  )
}

export default MyApp
