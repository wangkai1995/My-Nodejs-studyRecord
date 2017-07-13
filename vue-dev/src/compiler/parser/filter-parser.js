/* @flow */

const validDivisionCharRE = /[\w).+\-_$\]]/



//编译过滤器  比如 {{ showDate | dateFormat }}
export function parseFilters (exp: string): string {
  //是否单数
  let inSingle = false
  //是否双数
  let inDouble = false
  //是否模板字符
  let inTemplateString = false
  //是否正则
  let inRegex = false
  //折起来的？
  let curly = 0
  //平坦的？
  let square = 0
  //括号？
  let paren = 0
  //最后过滤的坐标
  let lastFilterIndex = 0
  let c, prev, i, expression, filters
  

  //开始遍历一些特殊表达式
  //不能出现在文本中
  for (i = 0; i < exp.length; i++) {
    prev = c
    c = exp.charCodeAt(i)
    if (inSingle) {                                       
      if (c === 0x27 && prev !== 0x5C) inSingle = false   //这里检测的'并且前面没/ 表示已经''结束   //0x27 = ' //0x5c = /
    } else if (inDouble) {
      if (c === 0x22 && prev !== 0x5C) inDouble = false   //这里检测的"并且前面没/ 表示已经""结束   //0x22 = "
    } else if (inTemplateString) {
      if (c === 0x60 && prev !== 0x5C) inTemplateString = false  //这里检测的`并且前面没/ 表示已经``结束  //0x60 = `
    } else if (inRegex) {
      if (c === 0x2f && prev !== 0x5C) inRegex = false    //这里检测的/并且前面没/ 表示已经//结束   //0x2f = /
    } else if (
      c === 0x7C && // pipe                   //0x7c = |
      exp.charCodeAt(i + 1) !== 0x7C &&       //这里应该是 | 管道
      exp.charCodeAt(i - 1) !== 0x7C &&       //并且没有{ [ (包裹
      !curly && !square && !paren
    ) {
      if (expression === undefined) {         //如果表达式不存在
        // first filter, end of expression    
        lastFilterIndex = i + 1
        expression = exp.slice(0, i).trim()   // 这里获取管道 | 之前的部分
      } else {
        pushFilter()                          //存在则直接编译
      }
    } else {
      //检测是否特殊包裹
      switch (c) {
        case 0x22: inDouble = true; break         // "     
        case 0x27: inSingle = true; break         // '
        case 0x60: inTemplateString = true; break // `
        case 0x28: paren++; break                 // (
        case 0x29: paren--; break                 // )
        case 0x5B: square++; break                // [
        case 0x5D: square--; break                // ]
        case 0x7B: curly++; break                 // {
        case 0x7D: curly--; break                 // }
      }
      if (c === 0x2f) { // /      如果当前字符串是/
        let j = i - 1 
        let p
        // find first non-whitespace prev char
        for (; j >= 0; j--) {     //向前寻找到非空字符
          p = exp.charAt(j)
          if (p !== ' ') break    //跳出
        }
        if (!p || !validDivisionCharRE.test(p)) {   //如果没找到非空字符  而且没有有效分割字符
          inRegex = true    //是正则表达式
        }
      }
    }
  }
  
  //如果表达式不存在 则赋值过去
  if (expression === undefined) {
    expression = exp.slice(0, i).trim()
  } else if (lastFilterIndex !== 0) {
    //如果表达式filter不等于0 压入filter栈中
    pushFilter()
  }
  
  //下面这一段pushFilter是| 中调用filter 把表达式 压入filter栈中
  function pushFilter () {
    (filters || (filters = [])).push(exp.slice(lastFilterIndex, i).trim())
    lastFilterIndex = i + 1
  }

  //处理filters栈中的表达式
  if (filters) {
    for (i = 0; i < filters.length; i++) {
      //字符在这里被转换成函数 wrapFilter
      expression = wrapFilter(expression, filters[i])
    }
  }
  
  //返回
  return expression
}


//转换过滤器
function wrapFilter (exp: string, filter: string): string {
  const i = filter.indexOf('(')
  //如果存在括号
  if (i < 0) {
    // _f: resolveFilter
    //先接收filter filter是一个函数
    return `_f("${filter}")(${exp})`
  } else {
    //获取到过滤器名 和过滤器参数
    const name = filter.slice(0, i)
    const args = filter.slice(i + 1)
    //传入
    return `_f("${name}")(${exp},${args}`
  }
}


