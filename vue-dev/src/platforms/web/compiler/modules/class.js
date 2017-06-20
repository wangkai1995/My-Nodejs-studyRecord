/* @flow */

import { parseText } from 'compiler/parser/text-parser'
import {
  getAndRemoveAttr,
  getBindingAttr,
  baseWarn
} from 'compiler/helpers'

//转换Node
function transformNode (el: ASTElement, options: CompilerOptions) {
  //拿到警告方法
  const warn = options.warn || baseWarn
  //从attr中获取class
  const staticClass = getAndRemoveAttr(el, 'class')
  if (process.env.NODE_ENV !== 'production' && staticClass) {
    //获取表达式 传入class 和分隔符 校验？
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
  //如果class存在
  if (staticClass) {
    //赋值过去对应的class
    el.staticClass = JSON.stringify(staticClass)
  }
  //获取v-bind:class
  const classBinding = getBindingAttr(el, 'class', false /* getStatic */)
  if (classBinding) {
    //设置对应标志
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
