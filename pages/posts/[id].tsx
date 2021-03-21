import React from 'react'
import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
/** plugins */
import gfm from 'remark-gfm'

import HeadingRenderer from '@/components/heading-renderer'
import Layout from '@/components/layout'
import Date from '@/components/date'
import CodeBlock from '@/components/code-block'
import ThemeSwitchBtn from '@/components/theme-switch-btn'

import { getAllPostIds, getPostDataById } from '@/utils/posts'
import type { PostDataWithHtml } from '@/utils/posts'

import type { ExtractArrayType } from '@/typings/tools'

interface Props {
  postData: PostDataWithHtml
}

export default function Post({ postData }: Props) {
  return (
    <Layout>
      <Head>
        <title>
          {postData.title}
          {' '}    
          ——JeekDong&apos;s Blog 💻
        </title>
      </Head>

      <div className="font-bold text-2xl mb-2">
        {postData.title}
      </div>
      <div className="text-sm text-gray-600 mb-6 flex justify-between">
        <Date dateString={postData.date || ''} />
        <ThemeSwitchBtn />
      </div>
      <ReactMarkdown
        className="prose max-w-none mb-8"
        plugins={[gfm]}
        renderers={{
          code: CodeBlock
        }}
      >
        {postData.tocContents}
      </ReactMarkdown>
      <ReactMarkdown
        className="prose max-w-none"
        plugins={[gfm]}
        renderers={{
          code: CodeBlock,
          heading: HeadingRenderer
        }}
      >
        {postData.contents}
      </ReactMarkdown>
    </Layout>
  )
}

export async function getStaticPaths() {
  const paths = getAllPostIds()
  return {
    paths,
    fallback: false
  }
}
export async function getStaticProps(
  { params }: ExtractArrayType<ReturnType<typeof getAllPostIds>>
) {
  const postData = await getPostDataById(params.id)

  return {
    props: {
      postData
    }
  }
}
