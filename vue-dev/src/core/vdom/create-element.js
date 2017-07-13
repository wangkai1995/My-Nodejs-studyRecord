/* @flow */

import config from '../config'
import VNode, { createEmptyVNode } from './vnode'
import { createComponent } from './create-component'

import {
  warn,
  isDef,
  isUndef,
  isTrue,
  isPrimitive,
  resolveAsset
} from '../util/index'

import {
  normalizeChildren,
  simpleNormalizeChildren
} from './helpers/index'

const SIMPLE_NORMALIZE = 1
const ALWAYS_NORMALIZE = 2

// wrapper function for providing a more flexible interface
// without getting yelled at by flow
/***
  
***/


//构造虚拟节点
export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any,
  normalizationType: any,
  alwaysNormalize: boolean
): VNode {
  //如果data是数组或者简单的数据
  if (Array.isArray(data) || isPrimitive(data)) {
    normalizationType = children
    children = data
    data = undefined
  }
  //是否总是标准化
  if (isTrue(alwaysNormalize)) {
    normalizationType = ALWAYS_NORMALIZE
  }
  return _createElement(context, tag, data, children, normalizationType)
}




export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any,
  normalizationType?: number
): VNode {
  //如果data未定义
  if (isDef(data) && isDef((data: any).__ob__)) {
    process.env.NODE_ENV !== 'production' && warn(
      `Avoid using observed data object as vnode data: ${JSON.stringify(data)}\n` +
      'Always create fresh vnode data objects in each render!',
      context
    )
    return createEmptyVNode()
  }
  //如果标签名不存在
  if (!tag) {
    // in case of component :is set to falsy value
    return createEmptyVNode()
  }
  //以上都会返回创建一个空的虚拟元素


  // warn against non-primitive key
  // 如果都不存在 则报错
  if (process.env.NODE_ENV !== 'production' &&
    isDef(data) && isDef(data.key) && !isPrimitive(data.key)
  ) {
    warn(
      'Avoid using non-primitive value as key, ' +
      'use string/number value instead.',
      context
    )
  }

  // 帮助处理 子节点函数 和 插槽作用域
  // support single function children as default scoped slot
  // 如果子节点是数组 并且是函数
  if (Array.isArray(children) &&
    typeof children[0] === 'function'
  ) {
    data = data || {}
    //处理插槽作用域
    data.scopedSlots = { default: children[0] }
    children.length = 0
  }
  //如果总是标准化构建
  if (normalizationType === ALWAYS_NORMALIZE) {
    children = normalizeChildren(children)
    //如果是简单构建
  } else if (normalizationType === SIMPLE_NORMALIZE) {
    children = simpleNormalizeChildren(children)
  }

  //开始构建
  let vnode, ns
  if (typeof tag === 'string') {
    let Ctor
    ns = config.getTagNamespace(tag)
    //如果是可以构建的标签标签
    if (config.isReservedTag(tag)) {
      // platform built-in elements
      // 建立虚拟节点
      vnode = new VNode(
        config.parsePlatformTagName(tag), data, children,
        undefined, undefined, context
      )
    } else if (isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
      // 虚拟组件
      // component
      vnode = createComponent(Ctor, data, context, children, tag)
    } else {
      // 未知元素
      // unknown or unlisted namespaced elements
      // check at runtime because it may get assigned a namespace when its
      // parent normalizes children
      vnode = new VNode(
        tag, data, children,
        undefined, undefined, context
      )
    }
  } else {
    // direct component options / constructor
    vnode = createComponent(tag, data, context, children)
  }
  if (isDef(vnode)) {
    if (ns) applyNS(vnode, ns)
    return vnode
  } else {
    return createEmptyVNode()
  }
}





function applyNS (vnode, ns) {
  vnode.ns = ns
  if (vnode.tag === 'foreignObject') {
    // use default namespace inside foreignObject
    return
  }
  if (isDef(vnode.children)) {
    for (let i = 0, l = vnode.children.length; i < l; i++) {
      const child = vnode.children[i]
      if (isDef(child.tag) && isUndef(child.ns)) {
        applyNS(child, ns)
      }
    }
  }
}


