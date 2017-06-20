/* @flow */

import { decode } from 'he'
import { parseHTML } from './html-parser'
import { parseText } from './text-parser'
import { parseFilters } from './filter-parser'
import { cached, no, camelize } from 'shared/util'
import { genAssignmentCode } from '../directives/model'
import { isIE, isEdge, isServerRendering } from 'core/util/env'

import {
  addProp,
  addAttr,
  baseWarn,
  addHandler,
  addDirective,
  getBindingAttr,
  getAndRemoveAttr,
  pluckModuleFunction
} from '../helpers'


//事件正则
export const onRE = /^@|^v-on:/
//指令正则
export const dirRE = /^v-|^@|^:/
//for正则 对象还是数组
export const forAliasRE = /(.*?)\s+(?:in|of)\s+(.*)/
//循环正则
export const forIteratorRE = /\((\{[^}]*\}|[^,]*),([^,]*)(?:,([^,]*))?\)/

//函数正则
const argRE = /:(.*)$/
//bind正则
const bindRE = /^:|^v-bind:/
//修饰符正则
const modifierRE = /\.[^.]+/g

const decodeHTMLCached = cached(decode)

// configurable state
export let warn
let delimiters
let transforms
let preTransforms
let postTransforms
let platformIsPreTag
let platformMustUseProp
let platformGetTagNamespace

/**
 * Convert HTML string to AST.
 */

 //编译解析函数
 //传入 模板字符串
 //传入 编译配置参数
export function parse (
  template: string,
  options: CompilerOptions
): ASTElement | void {
  //获取警告函数
  warn = options.warn || baseWarn
  //获得前置标签
  platformIsPreTag = options.isPreTag || no
  //获得使用属性
  platformMustUseProp = options.mustUseProp || no
  //获得标签名间隔符
  platformGetTagNamespace = options.getTagNamespace || no

  //提取方法函数 pluckModuleFunction
  //转换节点方法
  transforms = pluckModuleFunction(options.modules, 'transformNode')
  //前置转换方法？
  preTransforms = pluckModuleFunction(options.modules, 'preTransformNode')
  //转换后方法？
  postTransforms = pluckModuleFunction(options.modules, 'postTransformNode')
  //分隔符
  delimiters = options.delimiters

  //初始化堆栈
  const stack = []
  //是否保存空白
  const preserveWhitespace = options.preserveWhitespace !== false
  //根
  let root
  //当前父节点？
  let currentParent
  let inVPre = false
  let inPre = false
  let warned = false

  function warnOnce (msg) {
    if (!warned) {
      warned = true
      warn(msg)
    }
  }

  function endPre (element) {
    // check pre state
    if (element.pre) {
      inVPre = false
    }
    if (platformIsPreTag(element.tag)) {
      inPre = false
    }
  }

  /**
    * isNonPhrasingTag *
    某一些标签，如address,article,aside,base，
    他们不能被p标签包裹，因此我们在遇到这些标签时需要小心处理，
    作者把这些标签全都放入到了isNonPhrasingTag这个map对象中
    
    * canBeLeftOpenTag *
    像colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source这些节点，
    不会直接包裹同类型的节点，即 <td><td>...</td></td> 是错误的，
    所以我们对于这类节点，
    我们遇到相同类型tag时，应该结束上一个tag，
    即 <td>xxx<td>xxx</td> 应该被解析为 <td>xxx</td><td>xxx</td>

    * shouldDecodeNewlines *
    这是IE上的一个bug, 如果dom节点的属性分多行书写，
    那么它会把'\n'转义成 &#10; ,而其它浏览器并不会这么做，因此需要手工处理

    * IS_REGEX_CAPTURING_BROKEN *
    这是火狐浏览器关于正则的一个bug，
    VUe的识别代码：
    let IS_REGEX_CAPTURING_BROKEN = false
    'x'.replace(/x(.)?/g, function (m, g) {
      IS_REGEX_CAPTURING_BROKEN = g === ''
    })

  **/


  //开始解析
  //传入模板
  //传入参数有 期望HTML 是否单元标签 canBeLeftOpenTag没懂  shouldDecodeNewlines是否解密？
  parseHTML(template, {
    warn,
    expectHTML: options.expectHTML,
    isUnaryTag: options.isUnaryTag,
    canBeLeftOpenTag: options.canBeLeftOpenTag,
    shouldDecodeNewlines: options.shouldDecodeNewlines,
    //开始函数
    //获取标签名 attrs数组 闭合状态
    start (tag, attrs, unary) {
      //校验标签名间隔
      // check namespace.
      // inherit parent ns if there is one
      // 是否继承父节点 或者获取标签名间隔
      const ns = (currentParent && currentParent.ns) || platformGetTagNamespace(tag)

      //判断是否是IE浏览器 并且NS是SVG
      // handle IE svg bug
      /* istanbul ignore if */
      if (isIE && ns === 'svg') {
        attrs = guardIESVGBug(attrs)
      }
      //建立AST元素 虚拟元素
      //类型为1
      //赋值标签名
      //attrs 数组
      //attrs 映射
      //子节点为空
      const element: ASTElement = {
        type: 1,
        tag,
        attrsList: attrs,
        attrsMap: makeAttrsMap(attrs),
        parent: currentParent,
        children: []
      }

      //标签名间隔如果存在
      if (ns) {
        //赋值
        element.ns = ns
      }

      //判断是否是被禁止标签或者是服务端渲染
      if (isForbiddenTag(element) && !isServerRendering()) {
        //elemnt 为禁止标签
        element.forbidden = true
        process.env.NODE_ENV !== 'production' && warn(
          'Templates should only be responsible for mapping the state to the ' +
          'UI. Avoid placing tags with side-effects in your templates, such as ' +
          `<${tag}>` + ', as they will not be parsed.'
        )
      }

      // apply pre-transforms
      // 如果preTransforms存在 那么执行上一节点转换方法
      for (let i = 0; i < preTransforms.length; i++) {
        preTransforms[i](element, options)
      }

      //如果虚拟上个节点不存在
      if (!inVPre) {
        //处理上一个节点
        processPre(element)
        //如果已经处理
        if (element.pre) {
          //虚拟节点标志
          inVPre = true
        }
      }


      //平台方法是否是Pre
      //服务端渲染用？
      if (platformIsPreTag(element.tag)) {
        inPre = true
      }

      //虚拟节点是否存在
      if (inVPre) {
        processRawAttrs(element)
      } else {
        //处理v-for 
        processFor(element)
        //处理v-if 
        processIf(element)
        //处理单次v-once 
        processOnce(element)
        //处理唯一标志v-key 
        processKey(element)

        // determine whether this is a plain element after
        // removing structural attributes
        //判断是否是一个简单元素
        //是否有attrs 并且没有key
        element.plain = !element.key && !attrs.length

        //处理ref
        processRef(element)
        //处理slot
        processSlot(element)
        //处理component
        processComponent(element)

        for (let i = 0; i < transforms.length; i++) {
          transforms[i](element, options)
        }

        //处理剩余Attr
        processAttrs(element)
      }

      //检查检验根节点
      function checkRootConstraints (el) {
        //非生产环境
        if (process.env.NODE_ENV !== 'production') {
          //根节点不能是slot
          if (el.tag === 'slot' || el.tag === 'template') {
            warnOnce(
              `Cannot use <${el.tag}> as component root element because it may ` +
              'contain multiple nodes.'
            )
          }
          //根节点不能存在 v-for
          if (el.attrsMap.hasOwnProperty('v-for')) {
            warnOnce(
              'Cannot use v-for on stateful component root element because ' +
              'it renders multiple elements.'
            )
          }
        }
      }

      // tree management
      // el 树管理
      // 是否是根节点
      if (!root) {
        //赋值根节点
        root = element
        //检查校验ROOT
        checkRootConstraints(root)
        //如果根节点存在 但是栈是空的 那么这个节点也是根节点
      } else if (!stack.length) {
        // allow root elements with v-if, v-else-if and v-else
        // 允许root 节点 v-if v-else-if v-else
        if (root.if && (element.elseif || element.else)) {
          checkRootConstraints(element)
          //root 添加if 容器
          addIfCondition(root, {
            exp: element.elseif,
            block: element
          })
        } else if (process.env.NODE_ENV !== 'production') {
          warnOnce(
            `Component template should contain exactly one root element. ` +
            `If you are using v-if on multiple elements, ` +
            `use v-else-if to chain them instead.`
          )
        }
      }

      //如果当前父节点存在 并且element没被禁止
      if (currentParent && !element.forbidden) {
        // 判断是否是elseif或者else
        if (element.elseif || element.else) {
          //处理if 容器
          processIfConditions(element, currentParent)
        } else if (element.slotScope) { // scoped slot
          //如果是solt
          //设置对应简单节点标志
          currentParent.plain = false
          //获取solt name
          const name = element.slotTarget || '"default"'
          ;(currentParent.scopedSlots || (currentParent.scopedSlots = {}))[name] = element
        } else {
          //将当前节点 加入到父节点中
          currentParent.children.push(element)
          element.parent = currentParent
        }
      }

      //如果不是自闭合标签
      if (!unary) {
        //当前赋值成当前 父节点
        currentParent = element
        //添加堆栈
        stack.push(element)
      } else {
        //结束标签
        endPre(element)
      }
      // apply post-transforms
      for (let i = 0; i < postTransforms.length; i++) {
        //执行转变
        postTransforms[i](element, options)
      }
    },
    //结束函数
    end () {
      // remove trailing whitespace
      const element = stack[stack.length - 1]
      const lastNode = element.children[element.children.length - 1]
      if (lastNode && lastNode.type === 3 && lastNode.text === ' ' && !inPre) {
        element.children.pop()
      }
      // pop stack
      stack.length -= 1
      currentParent = stack[stack.length - 1]
      endPre(element)
    },
    //处理文本函数
    chars (text: string) {
      //如果当前父节点不存在
      //报错返回
      if (!currentParent) {
        if (process.env.NODE_ENV !== 'production') {
          if (text === template) {
            warnOnce(
              'Component template requires a root element, rather than just text.'
            )
          } else if ((text = text.trim())) {
            warnOnce(
              `text "${text}" outside root element will be ignored.`
            )
          }
        }
        return
      }
      // ie textarea 存在占位符BUG
      // IE textarea placeholder bug
      /* istanbul ignore if */
      if (isIE &&
        currentParent.tag === 'textarea' &&
        currentParent.attrsMap.placeholder === text
      ) {
        return
      }
      //获得子元素数组
      const children = currentParent.children
      // inPre 是否是spirct style
      // text修正
      text = inPre || text.trim()
        ? isTextTag(currentParent) ? text : decodeHTMLCached(text)
        // only preserve whitespace if its not right after a starting tag
        : preserveWhitespace && children.length ? ' ' : ''
      //如果文本正确并且存在
      if (text) {
        let expression
        //非pre保护 并且节点不为空字符串 提取表达式成功
        if (!inVPre && text !== ' ' && (expression = parseText(text, delimiters))) {
          children.push({
            type: 2,
            expression,
            text
          })
        } else if (text !== ' ' || !children.length || children[children.length - 1].text !== ' ') {
          children.push({
            type: 3,
            text
          })
        }
      }
    }
  })
  return root
}



//处理 v-pre
function processPre (el) {
  //读取或移除v-pre
  //从缓存读取 如果缓存存在则删除
  if (getAndRemoveAttr(el, 'v-pre') != null) {
    el.pre = true
  }
}


function processRawAttrs (el) {
  const l = el.attrsList.length
  if (l) {
    const attrs = el.attrs = new Array(l)
    for (let i = 0; i < l; i++) {
      attrs[i] = {
        name: el.attrsList[i].name,
        value: JSON.stringify(el.attrsList[i].value)
      }
    }
  } else if (!el.pre) {
    // non root node in pre blocks with no attributes
    el.plain = true
  }
}


//处理唯一标示 KEY
function processKey (el) {
  //从attr映射中读取
  const exp = getBindingAttr(el, 'key')
  if (exp) {
    //标签名不能为template 不然报错
    if (process.env.NODE_ENV !== 'production' && el.tag === 'template') {
      warn(`<template> cannot be keyed. Place the key on real elements instead.`)
    }
    //设置对应标示
    el.key = exp
  }
}

//处理ref
function processRef (el) {
  //从映射中读取
  const ref = getBindingAttr(el, 'ref')
  if (ref) {
    el.ref = ref
    //检查是否是for
    el.refInFor = checkInFor(el)
  }
}

//处理 v-for
function processFor (el) {
  let exp
  //从attr映射中读取 v-for是否存在
  if ((exp = getAndRemoveAttr(el, 'v-for'))) {
    //获取for循环的对象 是对象还是数组
    const inMatch = exp.match(forAliasRE)
    //不存在则报错
    if (!inMatch) {
      process.env.NODE_ENV !== 'production' && warn(
        `Invalid v-for expression: ${exp}`
      )
      return
    }
    //获得For的对象 列如 v-for:" (val, key)in testData" 中的testData
    el.for = inMatch[2].trim()
    //获得for的item 列如 v-for:" (val, key) in testData"中的val,key
    const alias = inMatch[1].trim()
    /*
      获取后面的一系列规则 列如 v-for:" item in testData key='xxxx'" 中的key的作用类似 key=track-by="$index"
    */
    //如果存在 赋值iterator
    const iteratorMatch = alias.match(forIteratorRE)
    if (iteratorMatch) {
      el.alias = iteratorMatch[1].trim()
      el.iterator1 = iteratorMatch[2].trim()
      if (iteratorMatch[3]) {
        el.iterator2 = iteratorMatch[3].trim()
      }
    } else {
      el.alias = alias
    }
  }
}

//处理 v-if
function processIf (el) {
  //从attr映射中读取v-if
  const exp = getAndRemoveAttr(el, 'v-if')
  //如果存在
  if (exp) {
    //获取标志
    el.if = exp
    //添加if容器
    addIfCondition(el, {
      exp: exp,
      block: el
    })
  } else {
    //不存在则判断v-else 同样从映射中读取
    if (getAndRemoveAttr(el, 'v-else') != null) {
        //添加相应表示
        el.else = true
    }
    //判断 是否是v-else-if
    const elseif = getAndRemoveAttr(el, 'v-else-if')
    //如果有 那么设置对应标志
    if (elseif) {
        el.elseif = elseif
    }
  }
}


//处理if 容器
function processIfConditions (el, parent) {
  //获取子节点中第一个节点
  //这个一般是if
  const prev = findPrevElement(parent.children)
  //如果是if
  //那么添加到if容器
  if (prev && prev.if) {
    addIfCondition(prev, {
      exp: el.elseif,
      block: el
    })
    //没有则报错 因为else 之前不存在if
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `v-${el.elseif ? ('else-if="' + el.elseif + '"') : 'else'} ` +
      `used on element <${el.tag}> without corresponding v-if.`
    )
  }
}



//获取子节点数组中第一个元素
function findPrevElement (children: Array<any>): ASTElement | void {
  let i = children.length
  while (i--) {
    if (children[i].type === 1) {
      return children[i]
    } else {
      if (process.env.NODE_ENV !== 'production' && children[i].text !== ' ') {
        warn(
          `text "${children[i].text.trim()}" between v-if and v-else(-if) ` +
          `will be ignored.`
        )
      }
      children.pop()
    }
  }
}


//添加if容器
//el添加ifConditions 字段
function addIfCondition (el, condition) {
  if (!el.ifConditions) {
    el.ifConditions = []
  }
  el.ifConditions.push(condition)
}


//处理 v-once
function processOnce (el) {
  //从attr映射中读取 v-once
  const once = getAndRemoveAttr(el, 'v-once')
  if (once != null) {
    el.once = true
  }
}

//处理 slot
function processSlot (el) {
  //如果标签名是slot
  if (el.tag === 'slot') {
    //读取slot name
    el.slotName = getBindingAttr(el, 'name')
    //slot不能存在KEY
    if (process.env.NODE_ENV !== 'production' && el.key) {
      warn(
        `\`key\` does not work on <slot> because slots are abstract outlets ` +
        `and can possibly expand into multiple elements. ` +
        `Use the key on a wrapping element instead.`
      )
    }
  } else {
    //从attrs中读取solt
    const slotTarget = getBindingAttr(el, 'slot')
    //如果存在
    if (slotTarget) {
      //检查是否等于空 等于空赋值默认值
      el.slotTarget = slotTarget === '""' ? '"default"' : slotTarget
    }
    //标签是否是template
    if (el.tag === 'template') {
      //读取scope 从attrs映射中
      el.slotScope = getAndRemoveAttr(el, 'scope')
    }
  }
}

//处理 component
function processComponent (el) {
  let binding
  //从Attr 中读取IS 或者 v-bind:is
  if ((binding = getBindingAttr(el, 'is'))) {
    el.component = binding
  }
  //从Attr中 读取inline-template
  if (getAndRemoveAttr(el, 'inline-template') != null) {
    //设置对应标志
    el.inlineTemplate = true
  }
}


//处理剩余Attr
function processAttrs (el) {
  const list = el.attrsList
  let i, l, name, rawName, value, modifiers, isProp
  //遍历剩余的attrs
  for (i = 0, l = list.length; i < l; i++) {
    //获取attrs key
    name = rawName = list[i].name
    //获取attrs value
    value = list[i].value
    //判断是否是 v-XXX的属性
    /*****  这里先略过  ******/
    if (dirRE.test(name)) {
      // mark element as dynamic
      //动态标记EL
      el.hasBindings = true
      // modifiers
      //解析 修饰符
      modifiers = parseModifiers(name)
      //如果存在修饰符
      if (modifiers) {
        //标签名清除掉修饰符字符串
        name = name.replace(modifierRE, '')
      }

      //如果是v-bind
      if (bindRE.test(name)) { // v-bind
        //先清除v-bind
        name = name.replace(bindRE, '')
        //解析过滤下值
        value = parseFilters(value)
        //设置对应标志
        isProp = false
        //如果修饰符存在
        if (modifiers) {
          //检查属性修饰符
          if (modifiers.prop) {
            isProp = true
            //处理连字符
            name = camelize(name)
            //修正
            if (name === 'innerHtml') name = 'innerHTML'
          }
          //如果存在驼峰修饰符
          if (modifiers.camel) {
            //处理连字符
            name = camelize(name)
          }
          //如果存在异步修饰符
          if (modifiers.sync) {
            //添加处理函数
            addHandler(
              el,
              `update:${camelize(name)}`,
              //分配事件CODE
              genAssignmentCode(value, `$event`)
            )
          }
        }

        /******  这一块先略过  *******/ 
        if (isProp || platformMustUseProp(el.tag, el.attrsMap.type, name)) {
          addProp(el, name, value)
        } else {
          addAttr(el, name, value)
        }
      } else if (onRE.test(name)) { // v-on
        name = name.replace(onRE, '')
        addHandler(el, name, value, modifiers, false, warn)
      } else { // normal directives
        name = name.replace(dirRE, '')
        // parse arg
        const argMatch = name.match(argRE)
        const arg = argMatch && argMatch[1]
        if (arg) {
          name = name.slice(0, -(arg.length + 1))
        }
        addDirective(el, name, rawName, value, arg, modifiers)
        if (process.env.NODE_ENV !== 'production' && name === 'model') {
          checkForAliasModel(el, value)
        }
      }
    } else {
      // attribute 列表
      // literal attribute
      if (process.env.NODE_ENV !== 'production') {
        const expression = parseText(value, delimiters)
        //如果存在修饰符 则报错
        if (expression) {
          warn(
            `${name}="${value}": ` +
            'Interpolation inside attributes has been removed. ' +
            'Use v-bind or the colon shorthand instead. For example, ' +
            'instead of <div id="{{ val }}">, use <div :id="val">.'
          )
        }
      }
      //添加attr属性
      //这里添加的attr应该属于DOM原生的attr
      addAttr(el, name, JSON.stringify(value))
    }
  }
}


//检查ref 是否是for
function checkInFor (el: ASTElement): boolean {
  let parent = el
  //找到父节点 在使用ref
  while (parent) {
    if (parent.for !== undefined) {
      return true
    }
    parent = parent.parent
  }
  return false
}


//解析 修饰符
function parseModifiers (name: string): Object | void {
  const match = name.match(modifierRE)
  //如果修饰符存在
  if (match) {
    const ret = {}
    match.forEach(m => { ret[m.slice(1)] = true })
    //获取修饰符并且返回
    return ret
  }
}


//标记attr映射
function makeAttrsMap (attrs: Array<Object>): Object {
  const map = {}
  for (let i = 0, l = attrs.length; i < l; i++) {
    if (
      process.env.NODE_ENV !== 'production' &&
      map[attrs[i].name] && !isIE && !isEdge
    ) {
      warn('duplicate attribute: ' + attrs[i].name)
    }
    map[attrs[i].name] = attrs[i].value
  }
  return map
}


// for script (e.g. type="x/template") or style, do not decode content
function isTextTag (el): boolean {
  return el.tag === 'script' || el.tag === 'style'
}


function isForbiddenTag (el): boolean {
  return (
    el.tag === 'style' ||
    (el.tag === 'script' && (
      !el.attrsMap.type ||
      el.attrsMap.type === 'text/javascript'
    ))
  )
}


const ieNSBug = /^xmlns:NS\d+/
const ieNSPrefix = /^NS\d+:/


/* istanbul ignore next */
function guardIESVGBug (attrs) {
  const res = []
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i]
    if (!ieNSBug.test(attr.name)) {
      attr.name = attr.name.replace(ieNSPrefix, '')
      res.push(attr)
    }
  }
  return res
}


function checkForAliasModel (el, value) {
  let _el = el
  while (_el) {
    if (_el.for && _el.alias === value) {
      warn(
        `<${el.tag} v-model="${value}">: ` +
        `You are binding v-model directly to a v-for iteration alias. ` +
        `This will not be able to modify the v-for source array because ` +
        `writing to the alias is like modifying a function local variable. ` +
        `Consider using an array of objects and use v-model on an object property instead.`
      )
    }
    _el = _el.parent
  }
}


