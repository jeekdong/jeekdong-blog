import Image from 'next/image'
import { useWindowScroll } from 'react-use'
import { useEffect, useState } from 'react'
import { useSpring, animated, config } from 'react-spring'

import { CLIENT_HEIGHT } from '@/utils/constants'

const BackTop = () => {
  const { y } = useWindowScroll()
  const [visible, setVisible] = useState(false)

  const props = useSpring({
    from: { right: visible ? '-100%' : '0.5rem', },
    to: { right: visible ? '0.5rem' : '-100%', },
    config: config.stiff
  })

  useEffect(() => {
    if (y > CLIENT_HEIGHT) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [y])

  const goToTop = () => {
    window.scroll({ top: 0, left: 0, behavior: 'smooth' })
  }

  return (
    <animated.div
      role="button"
      tabIndex={0}
      onClick={goToTop}
      style={props}
      className="h-10 px-4 button rounded-md transition-all bg-red-300 dark:bg-gray-500 opacity-80 fixed bottom-16 flex justify-center items-center active:bg-red-200"
    >
      <div
        className="w-4 h-4 inline-block relative"
      >
        <Image
          width="100"
          height="100"
          src="/arrow-top.svg"
        />
      </div>
      <span className="text-white text-sm ml-4">
        TO TOP
      </span>
    </animated.div>
  )
}

export default BackTop
