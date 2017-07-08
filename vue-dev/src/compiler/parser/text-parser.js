/* @flow */


import { cached } from 'shared/util'
import { parseFilters } from './filter-parser'

//默认捕获内容正在
//捕获{{}}中间内容 但是不包含:+任意字符和换行符
const defaultTagRE = /\{\{((?:.|\n)+?)\}\}/g
//避免正则表达式字符
const regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g


//自定义分隔符
const buildRegex = cached(delimiters => {
  //开始标签 要避免正则字符处理
  const open = delimiters[0].replace(regexEscapeRE, '\\$&')
  //结束标签 要避免正则字符处理
  const close = delimiters[1].replace(regexEscapeRE, '\\$&')
  //返回正则表达式 捕获自定义分隔符中间内容 但不包括:+任意字符 和换行符
  return new RegExp(open + '((?:.|\\n)+?)' + close, 'g')
})



//解析文本
//传入 文本字符串和分隔符
export function parseText (
  text: string,
  delimiters?: [string, string]
): string | void {
  //如果分隔符存在 那么用提取表达式替换 并且捕获中间内容
  //如果不存在那么用{{捕获内容}}
  //tagRE为提取内容正则
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
    //去除前后空格
    //拿到表达式并且解析过滤
    const exp = parseFilters(match[1].trim())

    //存入token中
    //简单数据_s(xxx)包装
    //复杂数据_f("${name}")(${exp},${args}包装
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






