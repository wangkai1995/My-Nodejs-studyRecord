/* @flow */

import {
  tip,
  toArray,
  hyphenate,
  handleError,
  formatComponentName
} from '../util/index'
import { updateListeners } from '../vdom/helpers/index'



// 初始化VM事件
export function initEvents (vm: Component) {
    // 创建时间对象
    vm._events = Object.create(null)
    // 创建钩子函数HAS
    vm._hasHookEvent = false
    // init parent attached events
    //获得父节点监听器
    const listeners = vm.$options._parentListeners
    if (listeners) {
      // 更新节点监听器,将自己挂载到父节点监听器中
      // 从虚拟节点事件中
      updateComponentListeners(vm, listeners)
    }
}





// target = VUE

let target: Component

function add (event, fn, once) {
  if (once) {
    //执行单次
    target.$once(event, fn)
  } else {
    //添加事件
    target.$on(event, fn)
  }
}

function remove (event, fn) {
  //取消事件
  target.$off(event, fn)
}


//更新组件监听器
export function updateComponentListeners (
  vm: Component,
  listeners: Object,
  oldListeners: ?Object
) {
  target = vm
  //如果老节点没有则未空初始化
  //传入ADD和remove
  updateListeners(listeners, oldListeners || {}, add, remove, vm)
}





export function eventsMixin (Vue: Class<Component>) {
  //标记正则
  const hookRE = /^hook:/

  //添加事件
  //event = 事件名或者事件数组
  Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
    const vm: Component = this
    //如果是事件名是数组传递
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        //递归添加自己
        this.$on(event[i], fn)
      }
    } else {
      //将事件添加进事件属性
      (vm._events[event] || (vm._events[event] = [])).push(fn)
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        //如果是钩子事件则标记对应属性
        vm._hasHookEvent = true
      }
    }
    return vm
  }


  //添加单次事件
  //只执行一次
  Vue.prototype.$once = function (event: string, fn: Function): Component {
    const vm: Component = this
    function on () {
      //先在事件列表中关闭自己
      vm.$off(event, on)
      //执行一次自己
      fn.apply(vm, arguments)
    }
    //添加执行函数到自己
    on.fn = fn
    //添加事件
    vm.$on(event, on)
    return vm
  }


  //删除事件
  Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {
    const vm: Component = this
    // all
    //如果传入参数为空 则删除所有事件
    if (!arguments.length) {
      vm._events = Object.create(null)
      return vm
    }

    // array of events
    //如果传入的是数组 则递归调用自己
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        this.$off(event[i], fn)
      }
      return vm
    }


    // specific event
    //从事件列表中获取自己
    const cbs = vm._events[event]
    //已经为空了 则直接结束
    if (!cbs) {
      return vm
    }
    //如果只传入事件名 则清楚对应事件名的执行函数
    if (arguments.length === 1) {
      vm._events[event] = null
      return vm
    }

    // specific handler
    //循环清除事件的执行函数
    let cb
    let i = cbs.length
    while (i--) {
      cb = cbs[i]
      if (cb === fn || cb.fn === fn) {
        cbs.splice(i, 1)
        break
      }
    }
    return vm
  }

  
  //执行事件函数
  Vue.prototype.$emit = function (event: string): Component {
    const vm: Component = this
    //如果不是生产环境
    if (process.env.NODE_ENV !== 'production') {
      //事件名小写匹配
      const lowerCaseEvent = event.toLowerCase()
      if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
        //事件名错了
        tip(
          `Event "${lowerCaseEvent}" is emitted in component ` +
          `${formatComponentName(vm)} but the handler is registered for "${event}". ` +
          `Note that HTML attributes are case-insensitive and you cannot use ` +
          `v-on to listen to camelCase events when using in-DOM templates. ` +
          `You should probably use "${hyphenate(event)}" instead of "${event}".`
        )
      }
    }

    //获取事件处理函数
    let cbs = vm._events[event]
    if (cbs) {
      cbs = cbs.length > 1 ? toArray(cbs) : cbs
      //事件处理函数转成数组

      const args = toArray(arguments, 1)
      //获取传入事件名
      for (let i = 0, l = cbs.length; i < l; i++) {
        try {
          //开始执行 this指向VM 传入参数名
          cbs[i].apply(vm, args)
        } catch (e) {
          //事件执行错误
          handleError(e, vm, `event handler for "${event}"`)
        }
      }
    }
    return vm
  }


}
