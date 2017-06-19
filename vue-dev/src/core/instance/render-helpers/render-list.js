/* @flow */

import { isObject, isDef } from 'core/util/index'

/**
 * Runtime helper for rendering v-for lists.
 */

 //渲染 v-for DOM
 //val =  值
 //render = 函数传入虚拟DOM
export function renderList (
  val: any,
  render: () => VNode
): ?Array<VNode> {
  let ret: ?Array<VNode>, i, l, keys, key

  //判断val是否是字符串或者数组
  if (Array.isArray(val) || typeof val === 'string') {
    //获取值长度
    ret = new Array(val.length)
    for (i = 0, l = val.length; i < l; i++) {
      //遍历传入 渲染 返回DOM
      ret[i] = render(val[i], i)
    }
  } else if (typeof val === 'number') {
    //如果是数值
    ret = new Array(val)
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i)
    }
  } else if (isObject(val)) {
    keys = Object.keys(val)
    ret = new Array(keys.length)
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i]
      ret[i] = render(val[key], key, i)
    }
  }
  if (isDef(ret)) {
    (ret: any)._isVList = true
  }
  return ret
}
