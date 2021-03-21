import React from 'react'

const Layout: React.FC = ({ children }) => {
  return <div className="py-4 m-auto mt-4 max-w-xs sm:max-w-xl md:max-w-2xl xl:max-w-3xl">{children}</div>
}

export default Layout
