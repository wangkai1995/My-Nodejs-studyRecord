/* @flow */

import { hasSymbol } from 'core/util/env'
import { warn } from '../util/index'
import { defineReactive } from '../observer/index'
import { hasOwn } from 'shared/util'

export function initProvide (vm: Component) {
  const provide = vm.$options.provide
  if (provide) {
    vm._provided = typeof provide === 'function'
      ? provide.call(vm)
      : provide
  }
}



//初始化注入
export function initInjections (vm: Component) {
  //接收注入参数
  const result = resolveInject(vm.$options.inject, vm)
  if (result) {
    //对注入内容进行监听
    Object.keys(result).forEach(key => {
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        defineReactive(vm, key, result[key], () => {
          warn(
            `Avoid mutating an injected value directly since the changes will be ` +
            `overwritten whenever the provided component re-renders. ` +
            `injection being mutated: "${key}"`,
            vm
          )
        })
      } else {
        defineReactive(vm, key, result[key])
      }
    })
  }
}








//接收注入参数
//inject = option.inject
export function resolveInject (inject: any, vm: Component): ?Object {
    //如果存在注入
    if (inject) {
      // inject is :any because flow is not smart enough to figure out cached
      // isArray here
      //注入是否是数组
      const isArray = Array.isArray(inject)
      //初始化返回值
      const result = Object.create(null)
      //获取注入的KEY
      const keys = isArray
        ? inject
        : hasSymbol
          ? Reflect.ownKeys(inject)
          : Object.keys(inject)
      //循环key
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        //获取注入内容
        const provideKey = isArray ? key : inject[key]
        let source = vm
        //这里获取VUE的注入
        //一直到根节点
        while (source) {
          if (source._provided && provideKey in source._provided) {
            result[key] = source._provided[provideKey]
            break
          }
          source = source.$parent
        }
        if (process.env.NODE_ENV !== 'production' && !hasOwn(result, key)) {
          warn(`Injection "${key}" not found`, vm)
        }
      }
      //返回注入内容
      return result
    }
}





