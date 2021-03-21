import React from 'react'
import { parseISO, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Props {
  dateString: string;
  className?: string;
}

export default function Date({ dateString, className = '' }: Props) {
  const date = parseISO(dateString)
  return (
    <time dateTime={dateString} className={className}>
      {format(date, 'LLLL d, yyyy', {
        locale: zhCN
      })}
    </time>
  )
}
