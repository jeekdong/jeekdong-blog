import React from 'react'
import Head from 'next/head'

import Layout from '@/components/layout'
import Date from '@/components/date'
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

      {postData.title}
      <br />
      {postData.id}
      <br />
      <Date dateString={postData.date || ''} />
      <br />
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: postData.contentHtml }} />
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
