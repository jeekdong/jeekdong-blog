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
// import PostToc from '@/components/post-toc'
import { FixedPostToc } from '@/components/post-toc'

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

      <div className="px-8 md:px-0">
        {/* 标题 */}
        <header className="text-center mb-12">
          <div className="font-bold text-3xl mb-4">
            {postData.title}
          </div>
          <div className="text-sm text-gray-600">
            <PostDate dateString={postData.date || ''} />
          </div>
        </header>
        <section className="flex w-full">
          {/* 目录 */}
          {
            postData.tocJson && postData.tocJson.length > 0 && (
              <FixedPostToc 
                tocContents={postData.tocContents}
                tocJson={postData.tocJson}
                className="-ml-32 w-72"
              />
            )
          }
          {/* 正文 */}
          <section className="break-all max-w-3xl m-auto">
            <ReactMarkdown
              className="prose dark:prose-light break-all max-w-none"
              plugins={[gfm]}
              renderers={{
                code: CodeBlock,
                heading: HeadingRenderer
              }}
            >
              {postData.contents}
            </ReactMarkdown>
          </section>
        </section>
      </div>
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
