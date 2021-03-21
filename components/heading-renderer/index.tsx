import React from 'react'

import { handleHeading } from '@/utils/tools'

const flatten = (
  text: string, 
  child: any
): any => {
  return typeof child === 'string'
    ? text + child
    : React.Children.toArray(child.props.children).reduce(flatten, text);
};

/**
 * HeadingRenderer is a custom renderer
 * It parses the heading and attaches an id to it to be used as an anchor
 */
const HeadingRenderer: React.FC<{
  level: number;
}> = props => {
  const {
    children,
    level
  } = props
  const child = React.Children.toArray(children);
  const text = child.reduce(flatten, '');
  const slug = handleHeading(text);
  const newChildren = (
    <>
      <a href={`#${slug}`} className="w-4 h-4 mr-2">
        #
      </a>
      {children}
    </>
  )
  return React.createElement(`h${level}`, { id: slug }, newChildren);
};

export default HeadingRenderer;
