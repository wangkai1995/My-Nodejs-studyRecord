/* @flow */

import config from '../config'
import Watcher from '../observer/watcher'
import { mark, measure } from '../util/perf'
import { createEmptyVNode } from '../vdom/vnode'
import { observerState } from '../observer/index'
import { updateComponentListeners } from './events'
import { resolveSlots } from './render-helpers/resolve-slots'

import {
  warn,
  noop,
  remove,
  handleError,
  emptyObject,
  validateProp
} from '../util/index'

export let activeInstance: any = null





//初始化生命周期
export function initLifecycle (vm: Component) {
  //获取配置
  const options = vm.$options
  // locate first non-abstract parent
  // 父节点抽象定位?
  // 获取父节点
  let parent = options.parent
  // 父节点存在并且当前节点没有抽象
  if (parent && !options.abstract) {
    // 如果父节点抽象存在,并且存在祖父节点
    while (parent.$options.abstract && parent.$parent) {
      //获得未抽象的父节点
      //或者到达根节点
      parent = parent.$parent
    }
    //将自己添加进去
    parent.$children.push(vm)
  }
  // 定位父节点是因为父节点生命周期变动,将影响下面的子节点变动？
  // 获取父节点和根节点
  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm
  // 自己的子节点设置为空
  vm.$children = []
  // 实例化标记对象设置为空
  vm.$refs = {}

  //监听器对象初始化
  vm._watcher = null
  //静态对象初始化
  vm._inactive = null
  //管理静态对象初始化
  vm._directInactive = false
  //是否挂载标志初始化
  vm._isMounted = false
  //是否卸载标志初始化
  vm._isDestroyed = false
  //是否准备卸载标志初始化
  vm._isBeingDestroyed = false
}





//生命周期方法初始化
export function lifecycleMixin (Vue: Class<Component>) {

  //添加原型方法 更新vue组件
  //传入虚拟节点对象
  //保持标志？？ hydrating？
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const vm: Component = this
    //如果节点已经挂载
    //那么调用钩子函数
    if (vm._isMounted) {
      callHook(vm, 'beforeUpdate')
    }

    //获取上一个DOM对象
    const prevEl = vm.$el
    //获取上一个 虚拟节点对象
    const prevVnode = vm._vnode
    //获取上一个激活的实例化对象
    const prevActiveInstance = activeInstance
    //激活的实例化对象重新赋值
    //activeInstance 是全局对象 这里没显示声明而已
    activeInstance = vm
    //重新获取传入的虚拟节点
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    //如果上一个虚拟结点不存在
    if (!prevVnode) {
      //重新渲染
      // initial render
      //传入DOM, 虚拟节点, 维护状态，不取消唯一,父DOM，refDOM
      //ref DOM 参考react
      //react ref 是以对象形式 键值对方式 保留虚拟DOM的实例DOM
      vm.$el = vm.__patch__(
        vm.$el, vnode, hydrating, false /* removeOnly */,
        vm.$options._parentElm,
        vm.$options._refElm
      )
    } else {
      // updates
      // 更新DOM
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
    // 全局激活实例 切换到当前激活
    activeInstance = prevActiveInstance
    // update __vue__ reference
    // 更新_vue_引用
    // 如果上个DOM存在的话
    if (prevEl) {
      prevEl.__vue__ = null
    }
    if (vm.$el) {
      // DOM的vue对象 重新更新
      vm.$el.__vue__ = vm
    }
    // if parent is an HOC, update its $el as well
    // 父组件虚拟节点如果和当前组件虚拟节点一致 则更新过去
    if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
      vm.$parent.$el = vm.$el
    }
    // updated hook is called by the scheduler to ensure that children are
    // updated in a parent's updated hook.
  }





  //原型方法强制更新
  Vue.prototype.$forceUpdate = function () {
    const vm: Component = this
    if (vm._watcher) {
      vm._watcher.update()
    }
  }


  //原型方法 卸载vue
  Vue.prototype.$destroy = function () {
    const vm: Component = this
    //如果已经卸载 则返回
    if (vm._isBeingDestroyed) {
      return
    }
    //钩子函数即将卸载
    callHook(vm, 'beforeDestroy')
    //卸载标志赋值
    vm._isBeingDestroyed = true
    // remove self from parent
    //获取父组件
    const parent = vm.$parent
    //如果父组件还存在 则从父组件中移除自己
    if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
      remove(parent.$children, vm)
    }
    //如果存在watcher 则卸载
    // teardown watchers
    if (vm._watcher) {
      vm._watcher.teardown()
    }
    let i = vm._watchers.length
    while (i--) {
      vm._watchers[i].teardown()
    }
    // remove reference from data ob
    // frozen object may not have observer.
    // 如果监听对象存在 
    // 则卸载observer
    if (vm._data.__ob__) {
      vm._data.__ob__.vmCount--
    }
    // 赋值卸载标志
    // call the last hook...
    vm._isDestroyed = true
    // invoke destroy hooks on current rendered tree
    // 清除自己的渲染树
    vm.__patch__(vm._vnode, null)
    // fire destroyed hook
    // 触发卸载生命周期钩子
    callHook(vm, 'destroyed')
    // turn off all instance listeners.
    // 取消全部实例监听
    vm.$off()
    // remove __vue__ reference
    if (vm.$el) {
      //DOM组件 vue对象注销
      vm.$el.__vue__ = null
    }
    // remove reference to DOM nodes (prevents leak)
    // 父节点DOM和REF DOM全部 赋值为null
    vm.$options._parentElm = vm.$options._refElm = null
  }
}



//挂载组件方法
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  //如果渲染方法不存在
  if (!vm.$options.render) {
    //渲染方法赋值为空的虚拟节点对象
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      //如果模板存在 第一个字符是#或者 EL存在 那么报错
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }

  //执行即将挂载回调
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      //开发环境 挂载的一些LOG
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`${name} patch`, startTag, endTag)
    }
  } else {
    //生产环境
    updateComponent = () => {
      vm._update(vm._render(), hydrating)
    }
  }


  //初始化观察者对象
  vm._watcher = new Watcher(vm, updateComponent, noop)
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}




export function updateChildComponent (
  vm: Component,
  propsData: ?Object,
  listeners: ?Object,
  parentVnode: VNode,
  renderChildren: ?Array<VNode>
) {
  // determine whether component has slot children
  // we need to do this before overwriting $options._renderChildren
  const hasChildren = !!(
    renderChildren ||               // has new static slots
    vm.$options._renderChildren ||  // has old static slots
    parentVnode.data.scopedSlots || // has new scoped slots
    vm.$scopedSlots !== emptyObject // has old scoped slots
  )

  vm.$options._parentVnode = parentVnode
  vm.$vnode = parentVnode // update vm's placeholder node without re-render
  if (vm._vnode) { // update child tree's parent
    vm._vnode.parent = parentVnode
  }
  vm.$options._renderChildren = renderChildren

  // update props
  if (propsData && vm.$options.props) {
    observerState.shouldConvert = false
    if (process.env.NODE_ENV !== 'production') {
      observerState.isSettingProps = true
    }
    const props = vm._props
    const propKeys = vm.$options._propKeys || []
    for (let i = 0; i < propKeys.length; i++) {
      const key = propKeys[i]
      props[key] = validateProp(key, vm.$options.props, propsData, vm)
    }
    observerState.shouldConvert = true
    if (process.env.NODE_ENV !== 'production') {
      observerState.isSettingProps = false
    }
    // keep a copy of raw propsData
    vm.$options.propsData = propsData
  }
  // update listeners
  if (listeners) {
    const oldListeners = vm.$options._parentListeners
    vm.$options._parentListeners = listeners
    updateComponentListeners(vm, listeners, oldListeners)
  }
  // resolve slots + force update if has children
  if (hasChildren) {
    vm.$slots = resolveSlots(renderChildren, parentVnode.context)
    vm.$forceUpdate()
  }
}



function isInInactiveTree (vm) {
  while (vm && (vm = vm.$parent)) {
    if (vm._inactive) return true
  }
  return false
}



export function activateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = false
    if (isInInactiveTree(vm)) {
      return
    }
  } else if (vm._directInactive) {
    return
  }
  if (vm._inactive || vm._inactive === null) {
    vm._inactive = false
    for (let i = 0; i < vm.$children.length; i++) {
      activateChildComponent(vm.$children[i])
    }
    callHook(vm, 'activated')
  }
}



export function deactivateChildComponent (vm: Component, direct?: boolean) {
  if (direct) {
    vm._directInactive = true
    if (isInInactiveTree(vm)) {
      return
    }
  }
  if (!vm._inactive) {
    vm._inactive = true
    for (let i = 0; i < vm.$children.length; i++) {
      deactivateChildComponent(vm.$children[i])
    }
    callHook(vm, 'deactivated')
  }
}


//执行钩子函数
export function callHook (vm: Component, hook: string) {
  //获取传入的配置参数中的 生命周期钩子执行函数
  const handlers = vm.$options[hook]
  //如果存在
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
      try {
        //执行生命周期钩子函数
        handlers[i].call(vm)
      } catch (e) {
        //钩子函数错误
        handleError(e, vm, `${hook} hook`)
      }
    }
  }
  //如果VM事件中存在钩子函数
  //比如..类似VM-on
  if (vm._hasHookEvent) {
    //那么执行
    vm.$emit('hook:' + hook)
  }
}


