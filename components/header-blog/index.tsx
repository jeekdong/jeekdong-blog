import Link from 'next/link'
import { AUTHOR } from '@/utils/constants'
import ThemeSwitchBtn from '@/components/theme-switch-btn'

const HeaderBlog = () => {
  return (
    <section className="flex justify-between h-20 items-center px-8 md:px-0 mb-16">
      <span className="text-3xl">
        <Link href="/">{AUTHOR}</Link>
      </span>
      <ThemeSwitchBtn />
    </section>
  )
}

export default HeaderBlog
