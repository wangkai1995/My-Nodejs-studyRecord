/* @flow */

import {
  warn,
  nextTick,
  toNumber,
  toString,
  looseEqual,
  emptyObject,
  handleError,
  looseIndexOf
} from '../util/index'

import VNode, {
  cloneVNodes,
  createTextVNode,
  createEmptyVNode
} from '../vdom/vnode'

import { createElement } from '../vdom/create-element'
import { renderList } from './render-helpers/render-list'
import { renderSlot } from './render-helpers/render-slot'
import { resolveFilter } from './render-helpers/resolve-filter'
import { checkKeyCodes } from './render-helpers/check-keycodes'
import { bindObjectProps } from './render-helpers/bind-object-props'
import { renderStatic, markOnce } from './render-helpers/render-static'
import { resolveSlots, resolveScopedSlots } from './render-helpers/resolve-slots'



//初始化渲染
export function initRender (vm: Component) {
  // 初始化虚拟节点和静态树
  vm._vnode = null // the root of the child tree
  vm._staticTrees = null
  //获取到虚拟父节点
  const parentVnode = vm.$vnode = vm.$options._parentVnode // the placeholder node in parent tree
  //获得渲染上下文 从父节点获取
  const renderContext = parentVnode && parentVnode.context
  //获取插槽
  vm.$slots = resolveSlots(vm.$options._renderChildren, renderContext)
  //创建插槽
  vm.$scopedSlots = emptyObject
  //创建虚拟节点
  // bind the createElement fn to this instance
  // so that we get proper render context inside it.
  // args order: tag, data, children, normalizationType, alwaysNormalize
  // internal version is used by render functions compiled from templates
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  //用户创建组件 方法
  // normalization is always applied for the public version, used in
  // user-written render functions.
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
}



export function renderMixin (Vue: Class<Component>) {

  //原型方法 下一个标志？
  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }

  //原型方法 渲染
  Vue.prototype._render = function (): VNode {
    const vm: Component = this
    //从配置里面获取
    //渲染方法 静态渲染方法 和父组件虚拟节点
    const {
      render,
      staticRenderFns,
      _parentVnode
    } = vm.$options
    // 是否挂载
    if (vm._isMounted) {
      // clone slot nodes on re-renders
      //复制 slot组件
      for (const key in vm.$slots) {
        vm.$slots[key] = cloneVNodes(vm.$slots[key])
      }
    }

    //从父节点获得slot作用域
    vm.$scopedSlots = (_parentVnode && _parentVnode.data.scopedSlots) || emptyObject
    //如果静态渲染方法存在 并且静态树不存在
    //这里可能是服务端渲染的步奏
    if (staticRenderFns && !vm._staticTrees) {
      vm._staticTrees = []
    }

    //设置父节点 允许渲染访问
    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    //拿到父组件虚拟节点
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
      //渲染执行, 获得虚拟节点
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      //如果出错处理错误
      handleError(e, vm, `render function`)
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      //如果不是生产环境
      if (process.env.NODE_ENV !== 'production') {
        //配置中渲染错误方法是否存在
        vnode = vm.$options.renderError
        //执行渲染错误方法
          ? vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
        //不存在直接获取虚拟节点方法
          : vm._vnode
      } else {
        vnode = vm._vnode
      }
    }


    // return empty vnode in case the render function errored out
    //如果虚拟节点不属于 虚拟节点类型
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      //创建空的虚拟节点
      vnode = createEmptyVNode()
    }
    // set parent
    //虚拟节点父节点赋值
    vnode.parent = _parentVnode
    //返回
    return vnode
  }

  // internal render helpers.
  // these are exposed on the instance prototype to reduce generated render
  // code size.
    

  //这下面的方法 都应用于 转换生成的虚拟节点data和节点编译生成的函数
  

  //原型方法标记 标记节点为静态单次节点
  Vue.prototype._o = markOnce
  //原型方法 转成number
  Vue.prototype._n = toNumber
  //原型方法 转成string
  Vue.prototype._s = toString
  //原型方法 渲染列表
  Vue.prototype._l = renderList
  //原型方法 渲染插槽
  Vue.prototype._t = renderSlot
  //原型方法 宽松的比较
  Vue.prototype._q = looseEqual
  //原型方法 宽松的查找IndexOf
  Vue.prototype._i = looseIndexOf
  //原型方法 静态渲染 服务端渲染
  Vue.prototype._m = renderStatic
  //原型方法 解决过滤 Promise.resolve？
  Vue.prototype._f = resolveFilter
  //原型方法 检查 event键值
  Vue.prototype._k = checkKeyCodes
  //原型方法 绑定对象属性
  Vue.prototype._b = bindObjectProps
  //原型方法 创建文本虚拟节点
  Vue.prototype._v = createTextVNode
  //原型方法 创建空虚拟节点
  Vue.prototype._e = createEmptyVNode
  //原型方法 解决插槽作用域 Promise.resolve？
  Vue.prototype._u = resolveScopedSlots
}






