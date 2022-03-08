import { useRouter } from 'next/router'
import { useState } from 'react'

const FooterBlog = () => {
  const router = useRouter()
  const [isIndex, setIsIndex] = useState(router.pathname === '/')

  return (
    <div className="px-8 md:px-0 py-10 text-center text-sm text-gray-400">
      POWERED BY JeekDong
      <div>
        theme: 
        {' '}
        <a
          href="https://github.com/jeekdong/jeekdong-blog"
          target="_blank"
          rel="noreferrer"
        >
          Github
        </a>
      </div>
      <div>
        ICP： 
        {' '}
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">浙ICP备20016976号-1</a>
      </div>
    </div>
  )
}

export default FooterBlog
