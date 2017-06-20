/* @flow */

/**
 * Cross-platform code generation for component v-model
 */
export function genComponentModel (
  el: ASTElement,
  value: string,
  modifiers: ?ASTModifiers
): ?boolean {
  const { number, trim } = modifiers || {}

  const baseValueExpression = '$$v'
  let valueExpression = baseValueExpression
  if (trim) {
    valueExpression =
      `(typeof ${baseValueExpression} === 'string'` +
        `? ${baseValueExpression}.trim()` +
        `: ${baseValueExpression})`
  }
  if (number) {
    valueExpression = `_n(${valueExpression})`
  }
  const assignment = genAssignmentCode(value, valueExpression)

  el.model = {
    value: `(${value})`,
    expression: `"${value}"`,
    callback: `function (${baseValueExpression}) {${assignment}}`
  }
}

/**
 * Cross-platform codegen helper for generating v-model value assignment code.
 */
 // v-model 分配编码
export function genAssignmentCode (
  value: string,
  assignment: string
): string {
  //解析model
  const modelRs = parseModel(value)
  //
  if (modelRs.idx === null) {
    return `${value}=${assignment}`
  } else {
    return `$set(${modelRs.exp}, ${modelRs.idx}, ${assignment})`
  }
}




/**
   数组更新转换解析成指令模块
 * parse directive model to do the array update transform. a[idx] = val => $$a.splice($$idx, 1, val)
 *
 * for循环可能出现下面情况
 * for loop possible cases:
 *
 * - test
 * - test[idx]
 * - test[test1[idx]]
 * - test["a"][idx]
 * - xxx.test[a[a].test1[idx]]
 * - test.xxx.a["asa"][test1[idx]]
 *
 */

let len, str, chr, index, expressionPos, expressionEndPos

export function parseModel (val: string): Object {
  str = val
  len = str.length
  //表达式开始 表达式结束
  index = expressionPos = expressionEndPos = 0
  //如果没有[] 则直接返回表达式为字符串 ID为null
  if (val.indexOf('[') < 0 || val.lastIndexOf(']') < len - 1) {
    return {
      exp: val,
      idx: null
    }
  }

  while (!eof()) {
    chr = next()
    /* istanbul ignore if */
    //判断是否是字符串开始 '或"
    if (isStringStart(chr)) {
      parseString(chr)
      //如果等于[
    } else if (chr === 0x5B) {
      parseBracket(chr)
    }
  }

  return {
    exp: val.substring(0, expressionPos),
    idx: val.substring(expressionPos + 1, expressionEndPos)
  }
}

//下一个字段
function next (): number {
  return str.charCodeAt(++index)
}

//判断是否结束
function eof (): boolean {
  return index >= len
}

//判断是否是字符串开始 '或"
function isStringStart (chr: number): boolean {
  return chr === 0x22 || chr === 0x27
}

//解析支架
function parseBracket (chr: number): void {
  let inBracket = 1
  expressionPos = index
  while (!eof()) {
    chr = next()
    if (isStringStart(chr)) {
      parseString(chr)
      continue
    }
    if (chr === 0x5B) inBracket++
    if (chr === 0x5D) inBracket--
    if (inBracket === 0) {
      expressionEndPos = index
      break
    }
  }
}

function parseString (chr: number): void {
  const stringQuote = chr
  while (!eof()) {
    chr = next()
    if (chr === stringQuote) {
      break
    }
  }
}
