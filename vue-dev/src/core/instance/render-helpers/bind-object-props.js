/* @flow */

import config from 'core/config'
import { isObject, warn, toObject } from 'core/util/index'

/**
 * Runtime helper for merging v-bind="object" into a VNode's data.
 */
 //绑定对象中的属性
export function bindObjectProps (
  data: any,
  tag: string,
  value: any,
  asProp?: boolean
): VNodeData {
  if (value) {
    //不是对象则直接报错
    if (!isObject(value)) {
      process.env.NODE_ENV !== 'production' && warn(
        'v-bind without argument expects an Object or Array value',
        this
      )
    } else {
      //如果是数组 则转成对象
      if (Array.isArray(value)) {
        value = toObject(value)
      }
      //属性映射
      let hash
      //遍历Key
      for (const key in value) {
        //如果是样式或者是类名
        if (key === 'class' || key === 'style') {
          //直接赋值过去
          hash = data
        } else {
          //获取数据的属性
          const type = data.attrs && data.attrs.type
          //判断是必须使用的属性  还是DOM属性  还是attr自定义属性
          hash = asProp || config.mustUseProp(tag, type, key)
            ? data.domProps || (data.domProps = {})
            : data.attrs || (data.attrs = {})
        }
        //这里没太理解
        if (!(key in hash)) {
          hash[key] = value[key]
        }
      }
    }
  }
  return data
}
