/**
 * Not type-checking this file because it's mostly vendor code.
 */

/*!
 * HTML Parser By John Resig (ejohn.org)
 * Modified by Juriy "kangax" Zaytsev
 * Original code by Erik Arvidsson, Mozilla Public License
 * http://erik.eae.net/simplehtmlparser/simplehtmlparser.js
 */

import { makeMap, no } from 'shared/util'
import { isNonPhrasingTag } from 'web/compiler/util'

// Regular Expressions for parsing tags and attributes
// 捕获 Attr 标示符
// 这个正则匹配 空格开头 或者“ ‘ < > =开头的值
const singleAttrIdentifier = /([^\s"'<>/=]+)/
// 捕获派发符号 
// 这个正则匹配 =号开始
const singleAttrAssign = /(?:=)/
// 捕获设置值
// source = 匹配模式所用文本
const singleAttrValues = [
  // attr value double quotes
  //捕获双等号引用
  //这个正则匹配"号开始到"结尾中间的内容
  /"([^"]*)"+/.source,
  //捕获单等号引用
  // attr value, single quotes
  //这个正则匹配'号开始到'结尾中间的内容
  /'([^']*)'+/.source,
  //捕获没有引用值
  //这个正则匹配 空格开头 或者“ ‘ < > =开头的值
  // attr value, no quotes
  /([^\s"'=<>`]+)/.source
]

//从头开始 空格开头 Attr 标示符 += 可能出现空格+=号+ 赋值
/**
    空格或者没有  (“ ‘ <>/=开头)+XXXX 空格或者没有+(不捕获=) +'内容'或者"内容" 或者 空格 ' " =<>开头的数据
  /^\s*([^\s"'<>\/=]+)(?:\s*((?:=))\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
**/
const attribute = new RegExp(
  '^\\s*' + singleAttrIdentifier.source +
  '(?:\\s*(' + singleAttrAssign.source + ')' +
  '\\s*(?:' + singleAttrValues.join('|') + '))?'
)



// could use https://www.w3.org/TR/1999/REC-xml-names-19990114/#NT-QName
// but for Vue templates we can enforce a simple charset
const ncname = '[a-zA-Z_][\\w\\-\\.]*'
// 捕获 (xxx\:)0或或多个前缀 +中间的ncname 主要捕获中间的ncname 一般是标签名
const qnameCapture = '((?:' + ncname + '\\:)?' + ncname + ')'
const startTagOpen = new RegExp('^<' + qnameCapture)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp('^<\\/' + qnameCapture + '[^>]*>')
const doctype = /^<!DOCTYPE [^>]+>/i
const comment = /^<!--/
const conditionalComment = /^<!\[/

let IS_REGEX_CAPTURING_BROKEN = false
'x'.replace(/x(.)?/g, function (m, g) {
  IS_REGEX_CAPTURING_BROKEN = g === ''
})

// Special Elements (can contain anything)
export const isPlainTextElement = makeMap('script,style,textarea', true)
const reCache = {}

const decodingMap = {
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&amp;': '&',
  '&#10;': '\n'
}
const encodedAttr = /&(?:lt|gt|quot|amp);/g
const encodedAttrWithNewLines = /&(?:lt|gt|quot|amp|#10);/g



//编译attr值内容
function decodeAttr (value, shouldDecodeNewlines) {
  //shouldDecodeNewlines=是否编译换行
  //将HTML字符编译为对应字符
  const re = shouldDecodeNewlines ? encodedAttrWithNewLines : encodedAttr
  return value.replace(re, match => decodingMap[match])
}



//开始解析HTML
//接收HTML字符
//接收配置参数
export function parseHTML (html, options) {
  //初始化堆栈
  const stack = []
  //获取预期html
  const expectHTML = options.expectHTML
  //是否自闭节点
  const isUnaryTag = options.isUnaryTag || no
  //这个没懂
  const canBeLeftOpenTag = options.canBeLeftOpenTag || no
  //下标
  let index = 0
  //尾和为标签
  let last, lastTag
  //循环遍历HTML
  while (html) {
    last = html
    // Make sure we're not in a plaintext content element like script/style
    if (!lastTag || !isPlainTextElement(lastTag)) {
      //获取文本结束标签
      let textEnd = html.indexOf('<')
      //如果位置是0 类似(<)div></div>
      if (textEnd === 0) {
        // Comment:
        // 正则判断是否是注释 <!--
        if (comment.test(html)) {
          const commentEnd = html.indexOf('-->')
          //获取到尾节点位置
          if (commentEnd >= 0) {
            //向前推进3位
            advance(commentEnd + 3)
            //结束这次循环
            continue
          }
        }

        //判断条件标签 <! 比如<!--[if !IE]>-->
        // http://en.wikipedia.org/wiki/Conditional_comment#Downlevel-revealed_conditional_comment
        if (conditionalComment.test(html)) {
          const conditionalEnd = html.indexOf(']>')
          //如果结束标签存在 向前推进2位
          if (conditionalEnd >= 0) {
            advance(conditionalEnd + 2)
            continue
          }
        }

        // Doctype:
        //获取文档类型捕获
        const doctypeMatch = html.match(doctype)
        //如果是文档类型标签
        if (doctypeMatch) {
          //向前推进捕获字符串长度
          advance(doctypeMatch[0].length)
          continue
        }

        // End tag:
        //获取结束标签
        const endTagMatch = html.match(endTag)
        if (endTagMatch) {
          //如果结束标签存在
          //获取当前字符串位置
          const curIndex = index
          //向前推进到结束
          advance(endTagMatch[0].length)
          //解析结尾标签
          //传入捕获字符串和当前index
          parseEndTag(endTagMatch[1], curIndex, index)
          continue
        }

        // Start tag:
        //以上都不是 则解析开始标签
        //获取开始标签
        const startTagMatch = parseStartTag()
        //如果存在开始标签捕获数据
        if (startTagMatch) {
          //开始处理开始标签
          handleStartTag(startTagMatch)
          continue
        }
      }

      //初始化参数
      let text, rest, next
      //如果标签内容结束距离大于0
      //这里判断的是<xxxx>|.....|(<)/xx>
      //||中的内容
      if (textEnd >= 0) {
        //获取内容
        //获取文本内容</xxx>这一段
        rest = html.slice(textEnd)
        /*
          这个while里面检测
          标签没有结束
          标签没有开始
          标签不是<!--
          标签不是<!
        */
        while (
          !endTag.test(rest) &&
          !startTagOpen.test(rest) &&
          !comment.test(rest) &&
          !conditionalComment.test(rest)
        ) {
          // < in plain text, be forgiving and treat it as text
          //这里判断是不是简单文本
          next = rest.indexOf('<', 1)
          if (next < 0) break
          textEnd += next
          rest = html.slice(textEnd)
        }
        //获取文本内容
        text = html.substring(0, textEnd)
        //字符串推进到结束标签
        advance(textEnd)
      }
      

      //判断是否结束了
      if (textEnd < 0) {
        text = html
        html = ''
      }

      //text存在 则开始编译标签内容
      if (options.chars && text) {
        //开始编译
        options.chars(text)
      }

    } else {
      var stackedTag = lastTag.toLowerCase()
      var reStackedTag = reCache[stackedTag] || (reCache[stackedTag] = new RegExp('([\\s\\S]*?)(</' + stackedTag + '[^>]*>)', 'i'))
      var endTagLength = 0
      var rest = html.replace(reStackedTag, function (all, text, endTag) {
        endTagLength = endTag.length
        if (!isPlainTextElement(stackedTag) && stackedTag !== 'noscript') {
          text = text
            .replace(/<!--([\s\S]*?)-->/g, '$1')
            .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, '$1')
        }
        if (options.chars) {
          options.chars(text)
        }
        return ''
      })
      index += html.length - rest.length
      html = rest
      parseEndTag(stackedTag, index - endTagLength, index)
    }

    if (html === last) {
      options.chars && options.chars(html)
      if (process.env.NODE_ENV !== 'production' && !stack.length && options.warn) {
        options.warn(`Mal-formatted tag at end of template: "${html}"`)
      }
      break
    }
  }

  // Clean up any remaining tags
  parseEndTag()

  //推进函数
  //坐标前进
  //这个很重要 while(html)依靠这里结束
  function advance (n) {
    index += n
    //html截取一部分
    html = html.substring(n)
  }


  //解析开始标签
  function parseStartTag () {
    //捕获开始标签名
    const start = html.match(startTagOpen)
    //如果存在
    if (start) {
      //捕获数据
      const match = {
        //标签名
        tagName: start[1],
        //设置参数
        attrs: [],
        //开始下标
        start: index
      }
      //HTML字符串向前推进 捕获的长度
      advance(start[0].length)
      let end, attr
      //循环遍历 
      //正则捕获是否结束end = html.match(startTagClose)) = />
      //正则捕获是否存在attr
      while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
        //不存在结束但是存在attr那么存入attrs数组
        //向前推进到正则匹配结果尾
        advance(attr[0].length)
        match.attrs.push(attr)
      }
      //如果到结尾标签
      if (end) {
        //这里没太懂
        match.unarySlash = end[1]
        //向前推进到标签尾
        advance(end[0].length)
        //获得结束长度
        match.end = index
        //返回捕获结果
        return match
      }
    }
  }



  //处理开始标签
  function handleStartTag (match) {
    //获得元素名
    const tagName = match.tagName
    //是否是自闭标签
    const unarySlash = match.unarySlash

    if (expectHTML) {
      //如果结束标签是P标签 并且当前捕获的标签不能包括在P标签中
      if (lastTag === 'p' && isNonPhrasingTag(tagName)) {
        //提前结束标签
        parseEndTag(lastTag)
      }
      //canBeLeftOpenTag 类型标签 并且结束标签是这个
      //canBeLeftOpenTag 是什么类型标签？？
      if (canBeLeftOpenTag(tagName) && lastTag === tagName) {
        //提前结束
        parseEndTag(tagName)
      }
    }

    //闭合标签 判断捕获标签 是否是自闭标签 或者HTMK 或者head 或者是自闭标签？
    const unary = isUnaryTag(tagName) || tagName === 'html' && lastTag === 'head' || !!unarySlash

    //获取attr数组长度
    const l = match.attrs.length
    //虚拟建立attr数组
    const attrs = new Array(l)
    //遍历数组
    for (let i = 0; i < l; i++) {
      const args = match.attrs[i]
      // hackish work around FF bug https://bugzilla.mozilla.org/show_bug.cgi?id=369778
      // 这里是为了解决火狐的正则表达式的一个BUG？
      if (IS_REGEX_CAPTURING_BROKEN && args[0].indexOf('""') === -1) {
        //如果捕获的数组 3 4 5 不存在则删除掉
        if (args[3] === '') { delete args[3] }
        if (args[4] === '') { delete args[4] }
        if (args[5] === '') { delete args[5] }
      }
      //从第四位开始拿起 第四位是attr参数
      const value = args[3] || args[4] || args[5] || ''
      //虚拟attrs数组长度1 
      attrs[i] = {
        name: args[1],
        //decodeAttr 编译attr参数
        value: decodeAttr(
          value,
          options.shouldDecodeNewlines
        )
      }
    }

    //是否没闭合
    if (!unary) {
      //将编译的HTML属性 压栈
      stack.push({ tag: tagName, lowerCasedTag: tagName.toLowerCase(), attrs: attrs })
      //上一个标签赋值
      lastTag = tagName
    }

    //如果传入了开始方法
    if (options.start) {
      //执行开始方法
      //传入 标签名 attrs集合数组 闭合状态 标签开始位置  标签结束位置
      options.start(tagName, attrs, unary, match.start, match.end)
    }
  }


  //处理结尾标签
  function parseEndTag (tagName, start, end) {
    let pos, lowerCasedTagName
    if (start == null) start = index
    if (end == null) end = index
    
    //转成小写
    if (tagName) {
      lowerCasedTagName = tagName.toLowerCase()
    }
    
    // Find the closest opened tag of the same type
    //找到最接近的打开相同类型的标签
    if (tagName) {
      for (pos = stack.length - 1; pos >= 0; pos--) {
        if (stack[pos].lowerCasedTag === lowerCasedTagName) {
          break
        }
      }
    } else {
      // If no tag name is provided, clean shop
      //如果没找到提供标签
      pos = 0
    }
    
    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (let i = stack.length - 1; i >= pos; i--) {
        if (process.env.NODE_ENV !== 'production' &&
          //如果没匹配到结束标签
          (i > pos || !tagName) &&
          options.warn
        ) {
          options.warn(
            `tag <${stack[i].tag}> has no matching end tag.`
          )
        }
        //开始结束标签
        if (options.end) {
          //开始添加结束标签
          options.end(stack[i].tag, start, end)
        }
      }

      // Remove the open elements from the stack
      stack.length = pos
      lastTag = pos && stack[pos - 1].tag
      //判断是否是</br>
    } else if (lowerCasedTagName === 'br') {
      if (options.start) {
        options.start(tagName, [], true, start, end)
      }
      //判断是否是P标签
    } else if (lowerCasedTagName === 'p') {
      if (options.start) {
        options.start(tagName, [], false, start, end)
      }
      if (options.end) {
        options.end(tagName, start, end)
      }
    }
  }


}




