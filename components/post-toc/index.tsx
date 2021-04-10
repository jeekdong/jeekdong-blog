import { memo } from 'react'
import ReactMarkdown from 'react-markdown'
/** plugins */
import gfm from 'remark-gfm'

interface Props {
  tocContents: string;
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


export const FixedPostToc = memo(({ tocContents }: Props) => {
  return (
    <div className="h-screen sticky top-20">
      <div className="bg-gray-800 p-4 rounded-md h-5/6 overflow-auto">
        <ReactMarkdown
          className="prose dark:prose-light break-words mb-8"
          plugins={[gfm]}
        >
          {tocContents}
        </ReactMarkdown>
      </div>
    </div>
  )
})
