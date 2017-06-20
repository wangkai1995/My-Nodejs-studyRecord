/* @flow */

import Dep from './dep'
import { arrayMethods } from './array'
import {
  def,
  isObject,
  isPlainObject,
  hasProto,
  hasOwn,
  warn,
  isServerRendering
} from '../util/index'


// 数组方法名
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)




/**
 * By default, when a reactive property is set, the new value is
 * also converted to become reactive. However when passing down props,
 * we don't want to force conversion because the value may be a nested value
 * under a frozen data structure. Converting it would defeat the optimization.
 */
 //是否创建双向绑定 shouldConvert应用嵌套数据时候？或者不希望转变的数据
 //是否设置属性
export const observerState = {
  shouldConvert: true,
  isSettingProps: false
}




/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that has this object as root $data

  constructor (value: any) {
    //获取值
    this.value = value
    //新建一个辅助监听
    this.dep = new Dep()
    //这个不太明白现在
    this.vmCount = 0
    //设置value的__ob__属性的object.defineProperty的属性为Observer is itself
    //set get暂未设置
    def(value, '__ob__', this)
    //如果只是数组
    if (Array.isArray(value)) {

      const augment = hasProto
        //如果是对象
        ? protoAugment
        //如果是数组
        : copyAugment

      //传入值 ，传入数组方法,传入数组方法名
      //这里设置传入值的object.defineProperty的一些属性 除了set和get
      augment(value, arrayMethods, arrayKeys)
      //执行建立双向绑定 传入是数组
      this.observeArray(value)
    } else {
      //执行建立双向绑定 传入是对象
      this.walk(value)
    }
  }

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      //遍历值 进行双向数据绑定
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      //递归调用自己 遍历对象
      //添加双向绑定
      observe(items[i])
    }
  }
}

// helpers


//增加拦截目标对象 通过__proto__ 拦截prototype
/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src: Object) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}


//输入数组设置object.defineProperty
//target拦截
/**
 * Augment an target Object or Array by defining
 * hidden properties.
 */
/* istanbul ignore next */
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    //设置值target的object.defineProperty
    def(target, key, src[key])
  }
}





//建立双向绑定监听
//这个函数如果传入的是已经存在observer的对象 则返回他的observer并且下面的child对象++
/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe (value: any, asRootData: ?boolean): Observer | void {
  //如果不是对象则直接返回
  if (!isObject(value)) {
    return
  }
  let ob: Observer | void
  //判断原型是否存在_ob_ 并且属于Observer对象
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    //存在则获取
    ob = value.__ob__
  } else if (
    //如果不存在_ob_
    //判断全局属性 shouldConvert 是否未真 允许建立双向绑定
    //判断不处于服务端渲染状态
    //并且是数组或者对象
    //并且是可以使用object.defineProperty的对象
    //并且不是vue对象
    observerState.shouldConvert &&
    !isServerRendering() &&
    (Array.isArray(value) || isPlainObject(value)) &&
    Object.isExtensible(value) &&
    !value._isVue
  ) {
    //创建双向绑定 返回监听者对象
    ob = new Observer(value)
  }
  //如果是根数据,并且存在监听者
  if (asRootData && ob) {
    //VM child count ++
    ob.vmCount++
  }
  //返回监听者对象
  return ob
}




//对传入对象添加监控
/**
 * Define a reactive property on an Object.
 */
export function defineReactive (
  obj: Object,
  key: string,
  val: any,
  customSetter?: Function
) {
  //初始化一个辅助绑定对象
  //用来保管watcher
  const dep = new Dep()

  //属性的描述符
  const property = Object.getOwnPropertyDescriptor(obj, key)
  //如果是并且不允许更改那么直接退出
  if (property && property.configurable === false) {
    return
  }

  //获取set 和 get 方法
  // cater for pre-defined getter/setters
  const getter = property && property.get
  const setter = property && property.set


  //子属性递归遍历创建 observer对象
  let childOb = observe(val)；

  //设置object.defineProperty
  //建立数据绑定监听
  Object.defineProperty(obj, key, {
    //允许枚举
    enumerable: true,
    //不准再次defineProperty
    configurable: true,
    //获取值拦截
    get: function reactiveGetter () {
      //获取到值
      const value = getter ? getter.call(obj) : val
      //绑定目标watcher是否存在
      if (Dep.target) {
        //存在则添加到绑定
        dep.depend()
        //如果存在
        if (childOb) {
          //子observer添加到绑定
          childOb.dep.depend()
        }
        //如果这个值是数据 那么遍历添加到绑定
        if (Array.isArray(value)) {
          dependArray(value)
        }
      }
      //返回这个值
      return value
    },
    set: function reactiveSetter (newVal) {
      //获取到老的值
      const value = getter ? getter.call(obj) : val
      /* eslint-disable no-self-compare */
      //如果值相当 或者新老值发生变化
      //这里的发生变化 可能是异步调用的时候 可能出现的问题
      //遇到上述情况 则直接结束
      if (newVal === value || (newVal !== newVal && value !== value)) {
        return
      }

      /* eslint-enable no-self-compare */
      //如果存在自定义set方法 并且不是生产环境 那么执行customSetter
      if (process.env.NODE_ENV !== 'production' && customSetter) {
        customSetter()
      }
      //如果设置方法存在
      if (setter) {
        //set方法执行 设置新值
        setter.call(obj, newVal)
      } else {
        //赋值新值
        val = newVal
      }
      //子observer更新
      childOb = observe(newVal)
      //触发监听通知
      dep.notify()
    }
  })
}







/**
 * Set a property on an object. Adds the new property and
 * triggers change notification if the property doesn't
 * already exist.
 */
 // 设置方法
 // 传入数组 或者对象
export function set (target: Array<any> | Object, key: any, val: any): any {
  //如果是数组 并且KEY是下标
  if (Array.isArray(target) && typeof key === 'number') {
    //获取最大长度
    target.length = Math.max(target.length, key)
    //下标位置插入值
    target.splice(key, 1, val)
    //返回watcher数组
    return val
  }

  //如果是对象
  if (hasOwn(target, key)) {
    //字段插入值
    target[key] = val
    返回值
    return val
  }

  // 获取observer对象
  const ob = (target: any).__ob__
  //如果是watcher监听的是VUE对象
  if (target._isVue || (ob && ob.vmCount)) {
    //不是生产环境则直接报错
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid adding reactive properties to a Vue instance or its root $data ' +
      'at runtime - declare it upfront in the data option.'
    )
    return val
  }
  //如果observer 不存在 则直接添加到watcher
  if (!ob) {
    target[key] = val
    return val
  }
  //重新设置双向绑定监听
  defineReactive(ob.value, key, val)
  //触发通知
  ob.dep.notify()
  return val
}





//删除监听
/**
 * Delete a property and trigger change if necessary.
 */
export function del (target: Array<any> | Object, key: any) {
  if (Array.isArray(target) && typeof key === 'number') {
    target.splice(key, 1)
    return
  }
  const ob = (target: any).__ob__
  if (target._isVue || (ob && ob.vmCount)) {
    process.env.NODE_ENV !== 'production' && warn(
      'Avoid deleting properties on a Vue instance or its root $data ' +
      '- just set it to null.'
    )
    return
  }
  if (!hasOwn(target, key)) {
    return
  }
  delete target[key]
  if (!ob) {
    return
  }
  //删除完毕触发更新通知
  ob.dep.notify()
}




/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}



