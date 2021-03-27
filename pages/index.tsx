import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'

import { HOME_TITLE } from '@/utils/constants'
import { getSortedPostsData } from '@/utils/posts'
import PostDate from '@/components/post-date'
import ThemeSwitchBtn from '@/components/theme-switch-btn'

import type { PostData } from '@/utils/posts'

interface Props {
  allPostsData: PostData[]
}

export default function Home({ allPostsData }: Props) {
  return (
    <div className="max-w-screen-lg mx-auto pb-10">
      <Head>
        <title>{HOME_TITLE}</title>
      </Head>
      <>
        <section className="text-center text-xl md:text-3xl">
          <div
            className="rounded-full w-32 h-32 md:w-40 md:h-40 relative m-auto overflow-hidden shadow-2xl mb-10 border"
          >
            <Image
              src="/avatar.png"
              layout="fill"
              objectFit="cover"
              quality={60}
            />
          </div>
          {HOME_TITLE}
          <div className="mt-4">
            <ThemeSwitchBtn />
          </div>
        </section>
        {/* Add this <section> tag below the existing <section> tag */}
        <section className="max-w-xl mx-auto m-10 px-8">
          <ul className="text-base py-5">
            {allPostsData.map(({ id, date, title }) => (
              <li key={id} className="mb-5 last:mb-0">
                <Link href={`/posts/${id}`}>
                  <span className="font-bold text-xl cursor-pointer">{title}</span>
                </Link>
                <br />
                <PostDate dateString={date || ''} className="text-gray-600 text-sm" />
              </li>
            ))}
          </ul>
        </section>
      </>
    </div>
  )
}

export async function getStaticProps() {
  const allPostsData = getSortedPostsData()

  return {
    props: {
      allPostsData
    }
  }
}
