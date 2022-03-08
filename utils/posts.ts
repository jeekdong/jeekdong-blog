import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import toc from 'markdown-toc'

import { handleHeading } from './tools'

// 这里不适用__dirname 因为next.js build 会在.next目录下执行，__dirname肯定是不对的
// 详情见 https://github.com/vercel/next.js/discussions/14341
const postsDirectory = path.join(process.cwd(), './posts')

export interface PostData {
  id: string;
  date?: string;
  title?: string;
  [key: string]: any;
}

export interface PostDataWithHtml extends PostData {
  contents: string;
  tocContents: string;
  tocJson: AnyObject[];
}

export function getSortedPostsData(): PostData[] {
  console.log(__dirname, postsDirectory)
  const fileNames = fs.readdirSync(postsDirectory)

  const allPostsData = fileNames.map<PostData>(fileName => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '')

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName)
    const fileContents = fs.readFileSync(fullPath, 'utf8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // Combine the data with the id
    return {
      id,
      ...matterResult.data
    }
  })

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    let dateA = a.date ?? 0
    let dateB = b.date ?? 0
    if (!dateA || !dateB) {
      console.warn(`「${a.id}」 该文章为填入日期date字段`)
    }
    if ((a.date || 0) < (b.date || 0)) {
      return 1
    }
    return -1
  })
}

export function getAllPostIds() {
  const fileNames = fs.readdirSync(postsDirectory)

  return fileNames.map(fileName => {
    return {
      params: {
        id: fileName.replace(/\.md$/, '')
      }
    }
  })
}

export function getPostDataById(id: string): PostDataWithHtml {
  const fullPath = path.join(postsDirectory, `${id}.md`)

  const fileContents = fs.readFileSync(fullPath, 'utf-8')

  const matterResult = matter(fileContents)

  const tocContents = toc(matterResult.content, {
    slugify: handleHeading
  }).content

  const tocJson = toc(matterResult.content, {
    slugify: handleHeading
  }).json

  return {
    id,
    contents: matterResult.content,
    tocContents,
    tocJson,
    ...matterResult.data
  }
}
