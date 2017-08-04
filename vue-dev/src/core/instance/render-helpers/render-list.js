/* @flow */

import { isObject, isDef } from 'core/util/index'

/**
 * Runtime helper for rendering v-for lists.
 */
 //渲染 V-for
 //render = 渲染方法 传如虚拟节点返回真实DOM？
export function renderList (
  val: any,
  render: () => VNode
): ?Array<VNode> {
  let ret: ?Array<VNode>, i, l, keys, key
  //如果值是数组 或 者字符串
  if (Array.isArray(val) || typeof val === 'string') {
    //获得实例数组
    ret = new Array(val.length)
    //遍历渲染虚拟节点
    for (i = 0, l = val.length; i < l; i++) {
      ret[i] = render(val[i], i)
    }
  } else if (typeof val === 'number') {
    //如果是数值
    ret = new Array(val)
    for (i = 0; i < val; i++) {
      ret[i] = render(i + 1, i)
    }
  } else if (isObject(val)) {
    //如果是对象
    keys = Object.keys(val)
    ret = new Array(keys.length)
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i]
      ret[i] = render(val[key], key, i)
    }
  }
  if (isDef(ret)) {
    //如果返回结果存在  那么设置对应标志
    (ret: any)._isVList = true
  }
  //返回渲染结果
  return ret
}





