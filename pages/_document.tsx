import React from 'react'
import Document, {
  DocumentContext, Html, Head, Main, NextScript 
} from 'next/document'

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)

    return initialProps
  }

  render() {
    return (
      <Html lang="zh-cmn-Hans" className="font-mono">
        <Head />
        <body className="dark:bg-black dark:text-white min-h-screen">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
