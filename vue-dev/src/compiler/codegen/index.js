/* @flow */

import { genHandlers } from './events'
import { baseWarn, pluckModuleFunction } from '../helpers'
import baseDirectives from '../directives/index'
import { camelize, no, extend } from 'shared/util'

type TransformFunction = (el: ASTElement, code: string) => string;
type DataGenFunction = (el: ASTElement) => string;
type DirectiveFunction = (el: ASTElement, dir: ASTDirective, warn: Function) => boolean;


//生成状态
export class CodegenState {
  options: CompilerOptions;
  warn: Function;
  transforms: Array<TransformFunction>;
  dataGenFns: Array<DataGenFunction>;
  directives: { [key: string]: DirectiveFunction };
  maybeComponent: (el: ASTElement) => boolean;
  onceId: number;
  staticRenderFns: Array<string>;
  
  //生成状态构造函数
  constructor (options: CompilerOptions) {
    //获取配置
    this.options = options
    //警告函数
    this.warn = options.warn || baseWarn
    //转换函数
    this.transforms = pluckModuleFunction(options.modules, 'transformCode')
    //数据转换成函数  data transfrom fn
    this.dataGenFns = pluckModuleFunction(options.modules, 'genData')
    //准则
    this.directives = extend(extend({}, baseDirectives), options.directives)
    //是否是保留标签
    const isReservedTag = options.isReservedTag || no
    //获取不确定性组件 
    this.maybeComponent = (el: ASTElement) => !isReservedTag(el.tag)
    //唯一ID
    this.onceId = 0
    //静态渲染函数队列
    this.staticRenderFns = []
  }
}

export type CodegenResult = {
  render: string,
  staticRenderFns: Array<string>
};




//开始生成
//传入虚拟节点
//传入配置
export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): CodegenResult {
  //开始生成状态 传入配置
  const state = new CodegenState(options)
  //传入虚拟函数和 状态 开始生成Element
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
  }
}



//生成Element
export function genElement (el: ASTElement, state: CodegenState): string {
  if (el.staticRoot && !el.staticProcessed) {
    //是否是Root 并且没静态处理
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) {
    //once类型
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) {
    //生成for
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    //生成IF
    return genIf(el, state)
  } else if (el.tag === 'template' && !el.slotTarget) {
    //生成template
    return genChildren(el, state) || 'void 0'
  } else if (el.tag === 'slot') {
    //生成slot
    return genSlot(el, state)
  } else {
    // component or element
    //组件元素
    let code
    if (el.component) {
      code = genComponent(el.component, el, state)
    } else {
      //不是组件元素
      //生成data
      const data = el.plain ? undefined : genData(el, state)
      //生成子元素
      const children = el.inlineTemplate ? null : genChildren(el, state, true)
      //children 经过转换可能得到的 列子 [_v("\n "+_s(message)+"\n ")]
      code = `_c('${el.tag}'${
        data ? `,${data}` : '' // data
      }${
        children ? `,${children}` : '' // children
      })`
      //组装在一起 获取code 
      //code 例子如下
      /*
        code =  _c('div',{attrs:{"id":"app"}}),[_v("\n "+_s(message)+"\n ")]
      */
    }
    // module transforms
    for (let i = 0; i < state.transforms.length; i++) {
      //转换el,code
      code = state.transforms[i](el, code)
    }
    return code
  }
}




// hoist static sub-trees out
function genStatic (el: ASTElement, state: CodegenState): string {
  el.staticProcessed = true
  state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`)
  return `_m(${state.staticRenderFns.length - 1}${el.staticInFor ? ',true' : ''})`
}



// v-once
function genOnce (el: ASTElement, state: CodegenState): string {
  el.onceProcessed = true
  if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else if (el.staticInFor) {
    let key = ''
    let parent = el.parent
    while (parent) {
      if (parent.for) {
        key = parent.key
        break
      }
      parent = parent.parent
    }
    if (!key) {
      process.env.NODE_ENV !== 'production' && state.warn(
        `v-once can only be used inside v-for that is keyed. `
      )
      return genElement(el, state)
    }
    return `_o(${genElement(el, state)},${state.onceId++}${key ? `,${key}` : ``})`
  } else {
    return genStatic(el, state)
  }
}



export function genIf (
  el: any,
  state: CodegenState,
  altGen?: Function,
  altEmpty?: string
): string {
  el.ifProcessed = true // avoid recursion
  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}



function genIfConditions (
  conditions: ASTIfConditions,
  state: CodegenState,
  altGen?: Function,
  altEmpty?: string
): string {
  if (!conditions.length) {
    return altEmpty || '_e()'
  }

  const condition = conditions.shift()
  if (condition.exp) {
    return `(${condition.exp})?${
      genTernaryExp(condition.block)
    }:${
      genIfConditions(conditions, state, altGen, altEmpty)
    }`
  } else {
    return `${genTernaryExp(condition.block)}`
  }

  // v-if with v-once should generate code like (a)?_m(0):_m(1)
  function genTernaryExp (el) {
    return altGen
      ? altGen(el, state)
      : el.once
        ? genOnce(el, state)
        : genElement(el, state)
  }
}



export function genFor (
  el: any,
  state: CodegenState,
  altGen?: Function,
  altHelper?: string
): string {
  const exp = el.for
  const alias = el.alias
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''

  if (process.env.NODE_ENV !== 'production' &&
    state.maybeComponent(el) &&
    el.tag !== 'slot' &&
    el.tag !== 'template' &&
    !el.key
  ) {
    state.warn(
      `<${el.tag} v-for="${alias} in ${exp}">: component lists rendered with ` +
      `v-for should have explicit keys. ` +
      `See https://vuejs.org/guide/list.html#key for more info.`,
      true /* tip */
    )
  }

  el.forProcessed = true // avoid recursion
  return `${altHelper || '_l'}((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
      `return ${(altGen || genElement)(el, state)}` +
    '})'
}




//生成data数据
export function genData (el: ASTElement, state: CodegenState): string {
  let data = '{'
  
  // directives first. 第一条指令
  //  可能生成变异的指令
  // directives may mutate the el's other properties before they are generated.
  //传入生成指令
  const dirs = genDirectives(el, state)
  if (dirs) data += dirs + ','

  //检查是否存在对应的设置
  // key
  if (el.key) {
    data += `key:${el.key},`
  }
  // ref
  if (el.ref) {
    data += `ref:${el.ref},`
  }
  if (el.refInFor) {
    data += `refInFor:true,`
  }
  // pre
  if (el.pre) {
    data += `pre:true,`
  }
  // record original tag name for components using "is" attribute
  if (el.component) {
    data += `tag:"${el.tag}",`
  }


  // 模块数据生成函数
  // module data generation functions
  for (let i = 0; i < state.dataGenFns.length; i++) {
    //这里是 state中的
    /*
        //转换函数
        this.transforms = pluckModuleFunction(options.modules, 'transformCode')
        //数据转换成函数  data transfrom fn
        this.dataGenFns = pluckModuleFunction(options.modules, 'genData')
    */
    data += state.dataGenFns[i](el)
  }

  
  // 如果属性存在 那么生成
  // attributes or props
  // 列如 attrs:{'id':'app'} 等JSON字符串
  if (el.attrs) {
    data += `attrs:{${genProps(el.attrs)}},`
  }


  // DOM props
  // 如果 props存在 同上attributes处理
  if (el.props) {
    data += `domProps:{${genProps(el.props)}},`
  }

  // 一系列事件处理 
  // 这后面的稍后再看
  // event handlers
  if (el.events) {
    data += `${genHandlers(el.events, false, state.warn)},`
  }

  if (el.nativeEvents) {
    data += `${genHandlers(el.nativeEvents, true, state.warn)},`
  }

  // slot target
  if (el.slotTarget) {
    data += `slot:${el.slotTarget},`
  }

  // scoped slots
  if (el.scopedSlots) {
    data += `${genScopedSlots(el.scopedSlots, state)},`
  }

  // component v-model
  if (el.model) {
    data += `model:{value:${
      el.model.value
    },callback:${
      el.model.callback
    },expression:${
      el.model.expression
    }},`
  }

  // inline-template
  if (el.inlineTemplate) {
    const inlineTemplate = genInlineTemplate(el, state)
    if (inlineTemplate) {
      data += `${inlineTemplate},`
    }
  }
  
  //去除尾部,加上}
  //生成出来 列如 最简单的 {attrs:{'id':'app'}}
  data = data.replace(/,$/, '') + '}'
  // V-bind 包括处理
  // v-bind data wrap
  if (el.wrapData) {
    data = el.wrapData(data)
  }
  return data
}



//生成指令
function genDirectives (el: ASTElement, state: CodegenState): string | void {
  const dirs = el.directives
  //如果el不存在directives 那么直接退出
  if (!dirs) return
  let res = 'directives:['
  let hasRuntime = false
  let i, l, dir, needRuntime
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i]
    needRuntime = true
    const gen: DirectiveFunction = state.directives[dir.name]
    if (gen) {
      // compile-time directive that manipulates AST.
      // returns true if it also needs a runtime counterpart.
      needRuntime = !!gen(el, dir, state.warn)
    }
    if (needRuntime) {
      hasRuntime = true
      res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
        dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}` : ''
      }${
        dir.arg ? `,arg:"${dir.arg}"` : ''
      }${
        dir.modifiers ? `,modifiers:${JSON.stringify(dir.modifiers)}` : ''
      }},`
    }
  }
  if (hasRuntime) {
    return res.slice(0, -1) + ']'
  }
}



function genInlineTemplate (el: ASTElement, state: CodegenState): ?string {
  const ast = el.children[0]
  if (process.env.NODE_ENV !== 'production' && (
    el.children.length > 1 || ast.type !== 1
  )) {
    state.warn('Inline-template components must have exactly one child element.')
  }
  if (ast.type === 1) {
    const inlineRenderFns = generate(ast, state.options)
    return `inlineTemplate:{render:function(){${
      inlineRenderFns.render
    }},staticRenderFns:[${
      inlineRenderFns.staticRenderFns.map(code => `function(){${code}}`).join(',')
    }]}`
  }
}



function genScopedSlots (
  slots: { [key: string]: ASTElement },
  state: CodegenState
): string {
  return `scopedSlots:_u([${
    Object.keys(slots).map(key => {
      return genScopedSlot(key, slots[key], state)
    }).join(',')
  }])`
}



function genScopedSlot (
  key: string,
  el: ASTElement,
  state: CodegenState
): string {
  if (el.for && !el.forProcessed) {
    return genForScopedSlot(key, el, state)
  }
  return `{key:${key},fn:function(${String(el.attrsMap.scope)}){` +
    `return ${el.tag === 'template'
      ? genChildren(el, state) || 'void 0'
      : genElement(el, state)
  }}}`
}



function genForScopedSlot (
  key: string,
  el: any,
  state: CodegenState
): string {
  const exp = el.for
  const alias = el.alias
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''
  el.forProcessed = true // avoid recursion
  return `_l((${exp}),` +
    `function(${alias}${iterator1}${iterator2}){` +
      `return ${genScopedSlot(key, el, state)}` +
    '})'
}


//生成子元素
// el = 虚拟元素
// state = 生成状态
// checkSkip = 检查跳过
// 后面的2个函数 暂时不清楚
export function genChildren (
  el: ASTElement,
  state: CodegenState,
  checkSkip?: boolean,
  altGenElement?: Function,
  altGenNode?: Function
): string | void {
  //获取子元素列表
  const children = el.children
  if (children.length) {
    //拿到第一个
    const el: any = children[0]
    

    // el单个for属性 特别优化
    // optimize single v-for
    if (children.length === 1 &&
      el.for &&
      el.tag !== 'template' &&
      el.tag !== 'slot'
    ) {
      return (altGenElement || genElement)(el, state)
    }
    
    //是否检查节点
    const normalizationType = checkSkip
      ? getNormalizationType(children, state.maybeComponent)
      : 0
    // 生成节点
    // 执行gen函数
    // genNode 是个递归处理的函数 根据节点type 判断是递归genElement 还是genText 
    const gen = altGenNode || genNode
    return `[${children.map(c => gen(c, state)).join(',')}]${
      normalizationType ? `,${normalizationType}` : ''
    }`
  }
}


// determine the normalization needed for the children array.
// 0: no normalization needed
// 1: simple normalization needed (possible 1-level deep nested array)
// 2: full normalization needed
function getNormalizationType (
  children: Array<ASTNode>,
  maybeComponent: (el: ASTElement) => boolean
): number {
  let res = 0
  for (let i = 0; i < children.length; i++) {
    const el: ASTNode = children[i]
    if (el.type !== 1) {
      continue
    }
    if (needsNormalization(el) ||
        (el.ifConditions && el.ifConditions.some(c => needsNormalization(c.block)))) {
      res = 2
      break
    }
    if (maybeComponent(el) ||
        (el.ifConditions && el.ifConditions.some(c => maybeComponent(c.block)))) {
      res = 1
    }
  }
  return res
}



function needsNormalization (el: ASTElement): boolean {
  return el.for !== undefined || el.tag === 'template' || el.tag === 'slot'
}



//根据节点类型判断生成 element 还是text
function genNode (node: ASTNode, state: CodegenState): string {
  if (node.type === 1) {
    return genElement(node, state)
  } else {
    return genText(node)
  }
}



//生成text
export function genText (text: ASTText | ASTExpression): string {
  // 如果节点属性是type 简单表达式 则直接返回
  // expression 在parseText 中parseFilter 里面得到
  // 复杂表达式 transformSpecialNewlines 做换行转换处理
  return `_v(${text.type === 2
    ? text.expression // no need for () because already wrapped in _s()
    : transformSpecialNewlines(JSON.stringify(text.text))
  })`
}





function genSlot (el: ASTElement, state: CodegenState): string {
  const slotName = el.slotName || '"default"'
  const children = genChildren(el, state)
  let res = `_t(${slotName}${children ? `,${children}` : ''}`
  const attrs = el.attrs && `{${el.attrs.map(a => `${camelize(a.name)}:${a.value}`).join(',')}}`
  const bind = el.attrsMap['v-bind']
  if ((attrs || bind) && !children) {
    res += `,null`
  }
  if (attrs) {
    res += `,${attrs}`
  }
  if (bind) {
    res += `${attrs ? '' : ',null'},${bind}`
  }
  return res + ')'
}


// componentName is el.component, take it as argument to shun flow's pessimistic refinement
function genComponent (
  componentName: string,
  el: ASTElement,
  state: CodegenState
): string {
  const children = el.inlineTemplate ? null : genChildren(el, state, true)
  return `_c(${componentName},${genData(el, state)}${
    children ? `,${children}` : ''
  })`
}



//生成属性
function genProps (props: Array<{ name: string, value: string }>): string {
  let res = ''
  for (let i = 0; i < props.length; i++) {
    //获取props attribute对象
    const prop = props[i]
    //转换编译成字符串 比如 "id":"app"
    res += `"${prop.name}":${transformSpecialNewlines(prop.value)},`
  }
  return res.slice(0, -1)
}


//转换特殊换行
// #3895, #4268
function transformSpecialNewlines (text: string): string {
  return text
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}


