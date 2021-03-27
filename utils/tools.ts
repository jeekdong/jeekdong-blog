// TODO: 优化 slug 的生成，非字符的encode
export function handleHeading(str: string) {
  // 空格替换为 -
  // & 过滤部分 markdown 语法字符
  return str.toLowerCase().replace(/\s/g, '-').replace(/([\\`*{}])/g, '')
}
