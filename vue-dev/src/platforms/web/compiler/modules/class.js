/* @flow */

import { parseText } from 'compiler/parser/text-parser'
import {
  getAndRemoveAttr,
  getBindingAttr,
  baseWarn
} from 'compiler/helpers'


//转换元素class
function transformNode (el: ASTElement, options: CompilerOptions) {
  const warn = options.warn || baseWarn
  //获取提取到的元素
  const staticClass = getAndRemoveAttr(el, 'class')
  if (process.env.NODE_ENV !== 'production' && staticClass) {
    //编译元素样式
    const expression = parseText(staticClass, options.delimiters)
    if (expression) {
      warn(
        `class="${staticClass}": ` +
        'Interpolation inside attributes has been removed. ' +
        'Use v-bind or the colon shorthand instead. For example, ' +
        'instead of <div class="{{ val }}">, use <div :class="val">.'
      )
    }
  }
  //如果存在样式
  if (staticClass) {
    el.staticClass = JSON.stringify(staticClass)
  }
  //建立元素绑定
  const classBinding = getBindingAttr(el, 'class', false /* getStatic */)
  if (classBinding) {
    //设置对应标签
    el.classBinding = classBinding
  }
}


function genData (el: ASTElement): string {
  let data = ''
  if (el.staticClass) {
    data += `staticClass:${el.staticClass},`
  }
  if (el.classBinding) {
    data += `class:${el.classBinding},`
  }
  return data
}


export default {
  staticKeys: ['staticClass'],
  transformNode,
  genData
}
