import React from 'react'
import Head from 'next/head'
import Link from 'next/link'

import { HOME_TITLE } from '@/utils/constants'
import { getSortedPostsData } from '@/utils/posts'
import Date from '@/components/date'

import type { PostData } from '@/utils/posts'

import styles from '../styles/Home.module.css'

interface Props {
  allPostsData: PostData[]
}

export default function Home({ allPostsData }: Props) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{HOME_TITLE}</title>
      </Head>
      <div>
        this is jeekdong blog
        {/* Add this <section> tag below the existing <section> tag */}
        <section>
          <h2>Blog</h2>
          <ul>
            {allPostsData.map(({ id, date, title }) => (
              <li key={id}>
                <Link href={`/posts/${id}`}>
                  {title}
                </Link>
                <br />
                {id}
                <br />
                <Date dateString={date || ''} />
              </li>
            ))}
          </ul>
        </section>
      </div>
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
