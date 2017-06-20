/* @flow */

import { cached } from 'shared/util'
import { parseFilters } from './filter-parser'

const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g

const buildRegex = cached(delimiters => {
  const open = delimiters[0].replace(regexEscapeRE, '\\$&')
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})



//解析文本
//传入 文本字符串和分隔符
export function parseText (
  text: string,
  delimiters?: [string, string]
): string | void {
  //如果分隔符存在 那么用'&'替换 并且捕获中间内容
  //如果不存在那么用{{捕获内容}}
  const tagRE = delimiters ? buildRegex(delimiters) : defaultTagRE
  //如果字符串不匹配 直接返回
  if (!tagRE.test(text)) {
    return
  }
  //初始化标记数组 上一次位置 当前位置 匹配对象
  const tokens = []
  let lastIndex = tagRE.lastIndex = 0
  let match, index

  //遍历匹配
  while ((match = tagRE.exec(text))) {
    //获取匹配到的最后位置
    index = match.index
    // push text token
    //将这段字符串成字符串 传入标记数组
    if (index > lastIndex) {
      tokens.push(JSON.stringify(text.slice(lastIndex, index)))
    }
    // tag token
    //拿到标签并且解析过滤
    const exp = parseFilters(match[1].trim())
    //存入token中
    tokens.push(`_s(${exp})`)
    lastIndex = index + match[0].length
  }
  //如果末尾还有东西
  if (lastIndex < text.length) {
    //都存入他token
    tokens.push(JSON.stringify(text.slice(lastIndex)))
  }
  //返token 字符串
  return tokens.join('+')
}




