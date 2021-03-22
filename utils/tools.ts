// TODO: 优化 slug 的生成，非字符的encode
export function handleHeading(str: string) {
  return str.toLowerCase().replace(/\s/g, '-')
}
