import { memo, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
/** plugins */
import gfm from 'remark-gfm'

interface Props {
  tocContents: string;
  className?: string;
}

const PostToc = ({ tocContents }: Props) => {
  return (
    <div>
      <ReactMarkdown
        className="prose dark:prose-light break-words max-w-none mb-8"
        plugins={[gfm]}
      >
        {tocContents}
      </ReactMarkdown>
    </div>
  )
}

export default memo(PostToc)


export const FixedPostToc = memo((
  { 
    tocContents, 
    tocJson,
    className
  }: Props & {
    tocJson: AnyObject[];
  }
) => {
  let tocData = useMemo(() => {
    let lastItem = {
      lvl: 100,
      level: 1,
    }
    // 遍历 tocJSon 计算标题等级
    return tocJson.map(item => {
      const { lvl } = item
      let level: number
      if (lvl < lastItem.lvl) {
        level = 1
        lastItem.lvl = lvl
        lastItem.level = level
      } else if (lvl > lastItem.lvl) {
        level = lastItem.level + 1
        lastItem.lvl = lvl
        lastItem.level = level
      } else {
        level = lastItem.level
        lastItem.lvl = lvl
        lastItem.level = level
      }
      return {
        level,
        content: item.content,
        slug: item.slug
      }
    })
  }, [tocJson])
  return (
    <div className={
      `h-screen sticky top-20 ${className}`
    }
    >
      {
        !!(tocJson && tocJson.length) && (
          <div 
            className="
            dark:bg-gray-800 
            bg-gray-100
              p-4 
              rounded-md 
              h-5/6 
              overflow-auto
            "
          >
            {/* <ReactMarkdown
          className="prose dark:prose-light break-words mb-8"
          plugins={[gfm]}
        >
          {tocContents}
        </ReactMarkdown> */}
            {
              tocData.map(item => {
                return (
                  <div 
                    data-level={item.level} 
                    key={item.slug}
                    className={`
                hover:bg-gray-200 
                dark:hover:bg-gray-900
                  rounded-md
                  text-sm
                  p-2
                  cursor-pointer 
                  ${item.level === 2 && 'ml-4'}
                  ${item.level === 3 && 'ml-8'}
              }`}
                  >
                    <a 
                      href={`#${item.slug}`}
                      className="block"
                    >
                      {item.content}
                    </a>
                  </div>
                )
              })
            }
          </div>
        )
      }
    </div>
  )
})
