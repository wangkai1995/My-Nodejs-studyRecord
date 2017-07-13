/* @flow */

import config from '../config'
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

//全局对象唯一ID
let uid = 0


/*****
  初始化混合
  @传入VUE 对象 class 类型
*****/
export function initMixin (Vue: Class<Component>) {

  /**
    原型方法初始化
    @配置对象
  **/
  Vue.prototype._init = function (options?: Object) {

    //获取vue对象
    const vm: Component = this

    //复制内部对象 唯一ID
    vm._uid = uid++

    //初始化开始标签和结束标签
    //自定义组件标签？
    let startTag, endTag
    /* istanbul ignore if */


    // 是否是开发环境
    // 生产环境创建缓存
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-init:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      //创建标签缓存
      //标记标签开始
      mark(startTag)
    }



    // a flag to avoid this being observed
    // 避开观察者标志?
    vm._isVue = true

    
    // merge options
    //合并配置
    //如果配置存在,并且是组件
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else {
      //如果不是组件 那么混合
      //获取配置参数
      vm.$options = mergeOptions(
        //接收构造函数参数
        //获取父级构造参数
        resolveConstructorOptions(vm.constructor),
        //传入参数
        options || {},
        //VM对象
        vm
      )
    }


    /* istanbul ignore else */
    //委托
    // 这里没看懂
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }



    // expose real self
    //获取自身
    vm._self = vm
    /**
      初始化生命周期
      这里初始化一些生命周期标志
    **/
    initLifecycle(vm)
    /**
      初始化VM事件
    **/
    initEvents(vm)
    //初始化渲染
    initRender(vm)
    //触发钩子函数beforeCreate 准备创建
    callHook(vm, 'beforeCreate')
    //初始化 准备注入参数和属性
    initInjections(vm) // resolve injections before data/props
    //初始化 状态
    //prop/data/computed/method/watch都在这里完成初始化
    initState(vm)
    // 这个没看懂
    // 可能是准备接收参数和属性？
    initProvide(vm) // resolve provide after data/props
    //触发钩子函数created ,创建
    callHook(vm, 'created')


    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      // 标签名
      vm._name = formatComponentName(vm, false)
      //标记标签结束？
      mark(endTag)
      //测量标签？
      measure(`${vm._name} init`, startTag, endTag)
    }

    // 开始挂载
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}





/**
  内部组件初始化
  @ VM：组件对象
  @ options ：组件参数
**/
function initInternalComponent (vm: Component, options: InternalComponentOptions) {
  // 将构造函数对象的属性 创建
  const opts = vm.$options = Object.create(vm.constructor.options)
  // 为了更快的创建对象枚举一些重要参数
  // doing this because it's faster than dynamic enumeration.
  // 父节点
  opts.parent = options.parent
  // 属性数据
  opts.propsData = options.propsData
  // 父节点虚拟节点
  opts._parentVnode = options._parentVnode
  // 父节点监听器
  opts._parentListeners = options._parentListeners
  // 渲染的子节点
  opts._renderChildren = options._renderChildren
  // 组件标签
  opts._componentTag = options._componentTag
  // 父节点DOM
  opts._parentElm = options._parentElm
  // ref = react (ref指向ref='XXXX'的实例化DOM)
  opts._refElm = options._refElm
  //是否渲染？
  if (options.render) {
    //获得 渲染对象
    opts.render = options.render
    // 静态渲染？
    // 这里没懂
    opts.staticRenderFns = options.staticRenderFns
  }
}



// 接收构造参数
// 获取构造参数
export function resolveConstructorOptions (Ctor: Class<Component>) {
  // 获得构造组件？
  let options = Ctor.options
  // 如果存在特别的配置
  if (Ctor.super) {
    // 获取特别的options
    const superOptions = resolveConstructorOptions(Ctor.super)
    // 获取缓存特别的options
    const cachedSuperOptions = Ctor.superOptions
    // 如果特别的options有变化
    if (superOptions !== cachedSuperOptions) {
      // 更新缓存
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
      // check if there are any late-modified/attached options (#4976)
      //接收改进的配置
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      //更新配置
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      //再次混合
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
  //获取构造参数
  return options
}



//接收修改配置
function resolveModifiedOptions (Ctor: Class<Component>): ?Object {
  let modified
  // 获取之前的配置
  const latest = Ctor.options
  // 获取额外的配置
  const extended = Ctor.extendOptions
  // 获取未知的配置
  const sealed = Ctor.sealedOptions
  // 循环之前的配置
  for (const key in latest) {
    // 如果老配置和新配置不想等
    if (latest[key] !== sealed[key]) {
      //如果修改对象不存在 则初始化
      if (!modified) modified = {}
      //创建监听新属性 返回到修改对象
      modified[key] = dedupe(latest[key], extended[key], sealed[key])
    }
  }
  //返回修改配置
  return modified
}





function dedupe (latest, extended, sealed) {
    // 比较匹配 老属性和新属性 确保生命周期钩子函数安全
    // compare latest and sealed to ensure lifecycle hooks won't be duplicated
    // between merges
    // 老属性 是数组
    if (Array.isArray(latest)) {
      const res = []
      // 获取 新属性和延伸属性 数组类型
      sealed = Array.isArray(sealed) ? sealed : [sealed]
      extended = Array.isArray(extended) ? extended : [extended]

      // 遍历老属性
      for (let i = 0; i < latest.length; i++) {
        // push original options and not sealed options to exclude duplicated options
        // 在延伸属性里存在 或者 位置属性里不存在
        // 排除重复的属性
        if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
          //获取
          res.push(latest[i])
        }
      }
      return res
    } else {
      // 不是数组 则直接返回老属性
      return latest
    }
}



