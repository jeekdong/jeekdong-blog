import React from 'react'
// import { parseISO, format } from 'date-fns'
// import { zhCN } from 'date-fns/locale'

interface Props {
  dateString: string;
  className?: string;
}

export default function PostDate({ dateString, className = '' }: Props) {
  const date = new Date(dateString)
  const addZero = (num: number) => {
    if (num < 10) {
      return `0${num}`
    }
    return num
  }
  return (
    <time dateTime={dateString} className={className}>
      {`${date.getFullYear()}-${addZero(date.getMonth() + 1)}-${addZero(date.getDate())}`}
    </time>
  )
}
