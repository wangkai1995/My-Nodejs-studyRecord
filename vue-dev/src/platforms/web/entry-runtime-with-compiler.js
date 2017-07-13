/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { shouldDecodeNewlines } from './util/compat'
import { compileToFunctions } from './compiler/index'

const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})


//这个是最开始的Vue.prototype.$mount
//路径\src\platforms\weex\runtime\index.js
const mount = Vue.prototype.$mount


//执行到这里  Vue.prototype.$mount被重新替换了
//原型方法挂载
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {

  //获取元素
  el = el && query(el)

  //如果元素是body或者是document直接报错
  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  //获取配置
  const options = this.$options
  // resolve template/el and convert to render function
  //如果不存在渲染属性
  if (!options.render) {
    //获取模板
    let template = options.template
    //如果模板存在
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    //如果模板不存在 元素存在
    } else if (el) {
      //从el outerHtml获取元素模板
      template = getOuterHTML(el)
    }


    //如果模板存在
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      //执行模板转成函数
      //编译模板
      //compileToFunctions = src/compiler/to-function
      const { render, staticRenderFns } = compileToFunctions(template, {
        //是否编译解码
        shouldDecodeNewlines,
        //分隔符
        delimiters: options.delimiters
      }, this)
      
      
      //这里的options 是vm.$option
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  //返回递归执行挂载函数
  return mount.call(this, el, hydrating)
}






//获取template模板
/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  //如果存在 outerHTML方法
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    //不存在建立一个container元素
    //加入自己 然后返回容器元素的innerHTML
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}


Vue.compile = compileToFunctions

export default Vue



