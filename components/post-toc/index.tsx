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
