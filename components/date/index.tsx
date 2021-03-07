import React from 'react'
import { parseISO, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface Props {
  dateString: string;
}

export default function Date({ dateString }: Props) {
  const date = parseISO(dateString)
  return (
    <time dateTime={dateString}>
      {format(date, 'LLLL d, yyyy', {
        locale: zhCN
      })}
    </time>
  )
}
