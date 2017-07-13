/* @flow */

import config from '../config'
import { warn } from './debug'
import { set } from '../observer/index'

import {
  ASSET_TYPES,
  LIFECYCLE_HOOKS
} from 'shared/constants'

import {
  extend,
  hasOwn,
  camelize,
  capitalize,
  isBuiltInTag,
  isPlainObject
} from 'shared/util'

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
const strats = config.optionMergeStrategies

/**
 * Options with restrictions
 */
if (process.env.NODE_ENV !== 'production') {
  //混合传入el 开发环境下
  //主要是判断不能为空
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {
      warn(
        `option "${key}" can only be used during instance ` +
        'creation with the `new` keyword.'
      )
    }
    return defaultStrat(parent, child)
  }
}



//递归的合并2个数据
/**
 * Helper that recursively merges two data objects together.
 */
function mergeData (to: Object, from: ?Object): Object {
  //如果来源数据不存在 那么直接返回改变的数据
  if (!from) return to
  let key, toVal, fromVal
  const keys = Object.keys(from)
  //遍历来源数据
  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    toVal = to[key]
    fromVal = from[key]
    //如果改变数据不存在
    if (!hasOwn(to, key)) {
      //设置改变数据 并且建立observer监听
      set(to, key, fromVal)
    } else if (isPlainObject(toVal) && isPlainObject(fromVal)) {
      //如果都是对象 那么递归合并
      mergeData(toVal, fromVal)
    }
  }
  return to
}


//混合数据
/**
 * Data
 */
strats.data = function (
  parentVal: any,
  childVal: any,
  vm?: Component
): ?Function {
  //如果VM上下文不存在
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    //判断是存在子data不存在则返回父data
    if (!childVal) {
      return parentVal
    }
    //子data不为函数则报错
    if (typeof childVal !== 'function') {
      process.env.NODE_ENV !== 'production' && warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.',
        vm
      )
      return parentVal
    }
    //父data 不存在则返回子data
    if (!parentVal) {
      return childVal
    }

    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    //上下文不存在则执行childVal和parentVal
    //混合data function 执行后的data
    return function mergedDataFn () {
      return mergeData(
          childVal.call(this),
          parentVal.call(this)
      )
    }
    //如果值存在
  } else if (parentVal || childVal) {
    //返回混合实例数据方法
    // vue 是将data数据转换为 函数执行
    return function mergedInstanceDataFn () {
      // instance merge
      //这里和闭包有关 初始化传入的childVal 在上面 这里返回的是一个闭包函数
      //如果childVal 被转换成函数  那么执行
      //如果没有被转换成函数 那么直接获取
      //parentVal 同上
      const instanceData = typeof childVal === 'function'
        ? childVal.call(vm)
        : childVal
      const defaultData = typeof parentVal === 'function'
        ? parentVal.call(vm)
        : undefined
        //如果实例数据存在
      if (instanceData) {
        //执行混合数据
        return mergeData(instanceData, defaultData)
      } else {
        //不存在实例数据 那么返回默认数据
        return defaultData
      }
    }
  }
}



/**
 * Hooks and props are merged as arrays.
 */
function mergeHook (
  parentVal: ?Array<Function>,
  childVal: ?Function | ?Array<Function>
): ?Array<Function> {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : Array.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

LIFECYCLE_HOOKS.forEach(hook => {
  strats[hook] = mergeHook
})



//混合对应属性方法
/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */
function mergeAssets (parentVal: ?Object, childVal: ?Object): Object {
  const res = Object.create(parentVal || null)
  //如果延伸存在 则获取延伸属性 不存在则直接返回父节参数
  return childVal
    ? extend(res, childVal)
    : res
}

ASSET_TYPES.forEach(function (type) {
  strats[type + 's'] = mergeAssets
})



//混合watch
/**
 * Watchers.
 *
 * Watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */
strats.watch = function (parentVal: ?Object, childVal: ?Object): ?Object {
  /* istanbul ignore if */
  if (!childVal) return Object.create(parentVal || null)
  if (!parentVal) return childVal
  const ret = {}
  extend(ret, parentVal)
  for (const key in childVal) {
    let parent = ret[key]
    const child = childVal[key]
    if (parent && !Array.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : Array.isArray(child) ? child : [child]
  }
  return ret
}



/**
 * Other object hashes.
 */
 //混合props,methods,computed
strats.props =
strats.methods =
strats.computed = function (parentVal: ?Object, childVal: ?Object): ?Object {
  if (!childVal) return Object.create(parentVal || null)
  if (!parentVal) return childVal
  const ret = Object.create(null)
  extend(ret, parentVal)
  extend(ret, childVal)
  return ret
}


/**
 * Default strategy.
 */
const defaultStrat = function (parentVal: any, childVal: any): any {
  return childVal === undefined
    ? parentVal
    : childVal
}



/**
 * Validate component names
 */
function checkComponents (options: Object) {
  for (const key in options.components) {
    const lower = key.toLowerCase()
    if (isBuiltInTag(lower) || config.isReservedTag(lower)) {
      warn(
        'Do not use built-in or reserved HTML elements as component ' +
        'id: ' + key
      )
    }
  }
}



//校验属性
//获得属性
/**
 * Ensure all props option syntax are normalized into the
 * Object-based format.
 */
function normalizeProps (options: Object) {
  //属性是从父节点传入
  //获得属性
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  //如果属性是数组
  if (Array.isArray(props)) {
    i = props.length
    //遍历
    while (i--) {
      //获得属性值
      val = props[i]
      //如果是字符串
      if (typeof val === 'string') {
        //将-后面的字符转为大写 或者清空
        name = camelize(val)
        //将属性 的对象类型 设置为空
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {
    //同上数组操作
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  }
  options.props = res
}


//修正指令
/**
 * Normalize raw function directives into object format.
 */
function normalizeDirectives (options: Object) {
  const dirs = options.directives
  //如果有指令
  if (dirs) {
    //遍历
    for (const key in dirs) {
      //获得定义的指令
      const def = dirs[key]
      //如果为函数  那么默认绑定给指令的 bind和update方法
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}



//混合options
// parent为VUE组件  不存在父组件 则传入VUE构造函数
// child为VUE组件
/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 */
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  //如果是生产环境 判断子组件是否是有效的
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)
  }

  //如果自组件是函数 则获取option
  if (typeof child === 'function') {
    child = child.options
  }


  //格式化属性
  normalizeProps(child)
  //格式化指令
  normalizeDirectives(child)
  //获得扩展
  const extendsFrom = child.extends
  if (extendsFrom) {
    //扩展存在则 混合到父节点中
    parent = mergeOptions(parent, extendsFrom, vm)
  }
  //如果传入vue存在混合 那么混合到父节点option中
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
  //建立一个空option
  const options = {}
  let key
  //遍历父节点
  for (key in parent) {
    //混合
    mergeField(key)
  }
  //遍历子节点
  for (key in child) {
    //如果父节点中没有这个参数
    if (!hasOwn(parent, key)) {
      //混合
      mergeField(key)
    }
  }
  function mergeField (key) {
    //获得对应的混合方法
    //mergeAssets
    const strat = strats[key] || defaultStrat
    //执行混合方法 获得混合的option
    options[key] = strat(parent[key], child[key], vm, key)
  }
  //返回混合配置参数
  return options
}

/**
 * Resolve an asset.
 * This function is used because child instances need access
 * to assets defined in its ancestor chain.
 */
export function resolveAsset (
  options: Object,
  type: string,
  id: string,
  warnMissing?: boolean
): any {
  /* istanbul ignore if */
  if (typeof id !== 'string') {
    return
  }
  const assets = options[type]
  // check local registration variations first
  if (hasOwn(assets, id)) return assets[id]
  const camelizedId = camelize(id)
  if (hasOwn(assets, camelizedId)) return assets[camelizedId]
  const PascalCaseId = capitalize(camelizedId)
  if (hasOwn(assets, PascalCaseId)) return assets[PascalCaseId]
  // fallback to prototype chain
  const res = assets[id] || assets[camelizedId] || assets[PascalCaseId]
  if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
    warn(
      'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
      options
    )
  }
  return res
}
