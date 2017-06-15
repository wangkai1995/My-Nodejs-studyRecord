/* @flow */

import config from '../config'
import Dep from '../observer/dep'
import Watcher from '../observer/watcher'

import {
  set,
  del,
  observe,
  observerState,
  defineReactive
} from '../observer/index'

import {
  warn,
  bind,
  noop,
  hasOwn,
  isReserved,
  handleError,
  validateProp,
  isPlainObject
} from '../util/index'

const sharedPropertyDefinition = {
  enumerable: true,
  configurable: true,
  get: noop,
  set: noop
}



export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}




//这里开始初始化状态
//prop/data/computed/method/watch都在这里完成初始化
export function initState (vm: Component) {
  //创建观察者数组
  vm._watchers = []
  //获取配置
  const opts = vm.$options
  //初始化属性
  if (opts.props) initProps(vm, opts.props)
  //初始化方法
  if (opts.methods) initMethods(vm, opts.methods)
  //判断是否传入数据
  if (opts.data) {
    //初始化数据
    //这里完成双向数据绑定
    initData(vm)
  } else {
    //添加观察者绑定
    //这里完成双向数据绑定 数据源为空对象
    observe(vm._data = {}, true /* asRootData */)
  }
  //初始化模板
  //HTML 模板在这里解析
  if (opts.computed) initComputed(vm, opts.computed)
  //添加观察者模式
  if (opts.watch) initWatch(vm, opts.watch)
}





const isReservedProp = {
  key: 1,
  ref: 1,
  slot: 1
}


//判断传入参数类型是否有错
function checkOptionType (vm: Component, name: string) {
  const option = vm.$options[name]
  if (!isPlainObject(option)) {
    warn(
      `component option "${name}" should be an object.`,
      vm
    )
  }
}



// 初始化属性
function initProps (vm: Component, propsOptions: Object) {
  // 获取属性参数
  const propsData = vm.$options.propsData || {}
  const props = vm._props = {}
  // 获取属性名
  // cache prop keys so that future props updates can iterate using Array
  // instead of dynamic object key enumeration.
  const keys = vm.$options._propKeys = []
  //判断是否是根节点
  const isRoot = !vm.$parent
  //  监听者状态是否转变
  //  root instance props should be converted
  observerState.shouldConvert = isRoot
  //遍历属性
  for (const key in propsOptions) {
    keys.push(key)
    //验证属性参数 获取正确属性
    const value = validateProp(key, propsOptions, propsData, vm)
    /* istanbul ignore else */
    //是否是开发环境
    if (process.env.NODE_ENV !== 'production') {
      //属性出现错误 不能是html保留属性
      if (isReservedProp[key] || config.isReservedAttr(key)) {
        warn(
          `"${key}" is a reserved attribute and cannot be used as component prop.`,
          vm
        )
      }
      //绑定双向数据绑定
      defineReactive(props, key, value, () => {
        if (vm.$parent && !observerState.isSettingProps) {
          warn(
            `Avoid mutating a prop directly since the value will be ` +
            `overwritten whenever the parent component re-renders. ` +
            `Instead, use a data or computed property based on the prop's ` +
            `value. Prop being mutated: "${key}"`,
            vm
          )
        }
      })
    } else {
      //绑定双向数据绑定
      defineReactive(props, key, value)
    }
    // static props are already proxied on the component's prototype
    // during Vue.extend(). We only need to proxy props defined at
    // instantiation here.
    if (!(key in vm)) {
      //定义空属性?
      proxy(vm, `_props`, key)
    }
  }
  //监听者状态发生转变
  observerState.shouldConvert = true
}



// 初始化传入数据
function initData (vm: Component) {
  //获取数据
  let data = vm.$options.data
  //如果data是函数 那么执行getData()获取数据 不是函数则直接获取
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  //如果不是对象则初始化空对象并且报错
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  //获得对象Key 和vm属性
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  let i = keys.length
  //遍历对象
  while (i--) {
    //如果data key 和props的key存在同名 则报错
    if (props && hasOwn(props, keys[i])) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${keys[i]}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    //key不是保留key
    } else if (!isReserved(keys[i])) {
      //添加到原型数据 添加 双向绑定监听
      proxy(vm, `_data`, keys[i])
    }
  }
  //根数据进行双向绑定监听
  // observe data
  observe(data, true /* asRootData */)
}



function getData (data: Function, vm: Component): any {
  try {
    return data.call(vm)
  } catch (e) {
    handleError(e, vm, `data()`)
    return {}
  }
}

const computedWatcherOptions = { lazy: true }

function initComputed (vm: Component, computed: Object) {
  process.env.NODE_ENV !== 'production' && checkOptionType(vm, 'computed')
  const watchers = vm._computedWatchers = Object.create(null)

  for (const key in computed) {
    const userDef = computed[key]
    let getter = typeof userDef === 'function' ? userDef : userDef.get
    if (process.env.NODE_ENV !== 'production') {
      if (getter === undefined) {
        warn(
          `No getter function has been defined for computed property "${key}".`,
          vm
        )
        getter = noop
      }
    }
    // create internal watcher for the computed property.
    watchers[key] = new Watcher(vm, getter, noop, computedWatcherOptions)

    // component-defined computed properties are already defined on the
    // component prototype. We only need to define computed properties defined
    // at instantiation here.
    if (!(key in vm)) {
      defineComputed(vm, key, userDef)
    } else if (process.env.NODE_ENV !== 'production') {
      if (key in vm.$data) {
        warn(`The computed property "${key}" is already defined in data.`, vm)
      } else if (vm.$options.props && key in vm.$options.props) {
        warn(`The computed property "${key}" is already defined as a prop.`, vm)
      }
    }
  }
}



export function defineComputed (target: any, key: string, userDef: Object | Function) {
  if (typeof userDef === 'function') {
    sharedPropertyDefinition.get = createComputedGetter(key)
    sharedPropertyDefinition.set = noop
  } else {
    sharedPropertyDefinition.get = userDef.get
      ? userDef.cache !== false
        ? createComputedGetter(key)
        : userDef.get
      : noop
    sharedPropertyDefinition.set = userDef.set
      ? userDef.set
      : noop
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}




function createComputedGetter (key) {
  return function computedGetter () {
    const watcher = this._computedWatchers && this._computedWatchers[key]
    if (watcher) {
      if (watcher.dirty) {
        watcher.evaluate()
      }
      if (Dep.target) {
        watcher.depend()
      }
      return watcher.value
    }
  }
}



//初始化方法
function initMethods (vm: Component, methods: Object) {
  //判断生产环境并且methods类型
  process.env.NODE_ENV !== 'production' && checkOptionType(vm, 'methods')
  //获得属性
  const props = vm.$options.props
  //循环遍历方法
  for (const key in methods) {
    //绑定对应方法
    //bind绑定作用域到vm对象
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm)
    //如果方法不存在 则报错
    if (process.env.NODE_ENV !== 'production') {
      if (methods[key] == null) {
        warn(
          `method "${key}" has an undefined value in the component definition. ` +
          `Did you reference the function correctly?`,
          vm
        )
      }
      if (props && hasOwn(props, key)) {
        warn(
          `method "${key}" has already been defined as a prop.`,
          vm
        )
      }
    }
  }
}




//初始化观察者
function initWatch (vm: Component, watch: Object) {
  //判断是否是开发环境,并且watch属性是否有错
  process.env.NODE_ENV !== 'production' && checkOptionType(vm, 'watch')
  //遍历watch
  for (const key in watch) {
    //获得watch属性 handler
    const handler = watch[key]
    //如果是数组
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        //创建watcher
        createWatcher(vm, key, handler[i])
      }
    } else {
      //创建watcher
      createWatcher(vm, key, handler)
    }
  }
}



//创建观察者
function createWatcher (
  vm: Component,
  keyOrFn: string | Function,
  handler: any,
  options?: Object
) {
  //如果传入参数是对象
  if (isPlainObject(handler)) {
    //获取对象
    options = handler
    //获取参数
    handler = handler.handler
  }
  if (typeof handler === 'string') {
    //获取参数
    handler = vm[handler]
  }
  //建立监听
  return vm.$watch(keyOrFn, handler, options)
}



//状态初始化vue类
//添加原型方法$watch
export function stateMixin (Vue: Class<Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.

  //初始化数据辅助对象
  const dataDef = {}
  //赋值get方法  
  //返回this._data数据 
  //this= vue对象
  dataDef.get = function () { return this._data }
  //初始化属性赋值对象
  const propsDef = {}
  //同上方法
  //返回this._props属性
  //this= vue对象
  propsDef.get = function () { return this._props }
  //如果不是开发环境
  if (process.env.NODE_ENV !== 'production') {
    //不允许设置$data和$props的数据
    dataDef.set = function (newData: Object) {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }

  //添加原型属性
  //$data $props 用来读取vue._data vue._props
  //并且不允许设置
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)

  //从observer 获取set 和del 方法 用来添加和删除 双向绑定的数据
  Vue.prototype.$set = set
  Vue.prototype.$delete = del


  //添加监听方法
  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    const vm: Component = this
    //如果是对象
    //递归调用自己 创建Watcher
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    //设置配置用户标志
    options.user = true
    //建立在watcher
    //在这个位置
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      //执行回调函数
      cb.call(vm, watcher.value)
    }
    return function unwatchFn () {
      //返回取消watcher 卸载方法
      watcher.teardown()
    }
  }
}


