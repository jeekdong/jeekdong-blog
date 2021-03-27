import React from 'react'
import Head from 'next/head'
import ReactMarkdown from 'react-markdown'
/** plugins */
import gfm from 'remark-gfm'

import HeadingRenderer from '@/components/heading-renderer'
import PostDate from '@/components/post-date'
import CodeBlock from '@/components/code-block'
import HeaderBlog from '@/components/header-blog'
import FooterBlog from '@/components/footer-blog'
import BackTop from '@/components/back-top'
import PostToc from '@/components/post-toc'

import { getAllPostIds, getPostDataById } from '@/utils/posts'
import type { PostDataWithHtml } from '@/utils/posts'

import type { ExtractArrayType } from '@/typings/tools'

interface Props {
  postData: PostDataWithHtml
}

export default function Post({ postData }: Props) {
  return (
    <>
      <Head>
        <title>
          {postData.title}
          {' '}    
          ——JeekDong&apos;s Blog 💻
        </title>
      </Head>
      <HeaderBlog />

      <header className="px-8 md:px-0 xl:px-0">
        <div className="font-bold text-2xl mb-4">
          {postData.title}
        </div>
        <div className="text-sm text-gray-600 mb-6 flex justify-between">
          <PostDate dateString={postData.date || ''} />
        </div>
      </header>
      <section className="px-8 md:px-0 xl:px-0">
        <PostToc tocContents={postData.tocContents} />
      </section>
      <section className="px-8 md:px-0 xl:px-0">
        <ReactMarkdown
          className="prose dark:prose-light break-words max-w-none"
          plugins={[gfm]}
          renderers={{
            code: CodeBlock,
            heading: HeadingRenderer
          }}
        >
          {postData.contents}
        </ReactMarkdown>
      </section>
      <BackTop />
      <FooterBlog />
    </>
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
