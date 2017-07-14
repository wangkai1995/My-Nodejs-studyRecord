/* @flow */

import { isIE9 } from 'core/util/env'

import {
  extend,
  isDef,
  isUndef
} from 'shared/util'

import {
  isXlink,
  xlinkNS,
  getXlinkProp,
  isBooleanAttr,
  isEnumeratedAttr,
  isFalsyAttrValue
} from 'web/util/index'


//更新 Attrs
function updateAttrs (oldVnode: VNodeWithData, vnode: VNodeWithData) {
  //如果都不存在 则跳出
  if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
    return
  }
  let key, cur, old
  //获取到当前元素
  const elm = vnode.elm
  //旧节点的attrs
  const oldAttrs = oldVnode.data.attrs || {}
  //当前节点的attrs
  let attrs: any = vnode.data.attrs || {}
  // clone observed objects, as the user probably wants to mutate it

  if (isDef(attrs.__ob__)) {
    // 复制观察者对象 因为用户可能需要改变
    attrs = vnode.data.attrs = extend({}, attrs)
  }

  for (key in attrs) {
    cur = attrs[key]
    old = oldAttrs[key]
    //如果老的值不等于新的值
    if (old !== cur) {
      //设置attr
      setAttr(elm, key, cur)
    }
  }
  // #4391: in IE9, setting type can reset value for input[type=radio]
  // IE9 input[type=radio] 设置类型会导致重置值
  /* istanbul ignore if */
  if (isIE9 && attrs.value !== oldAttrs.value) {
    //IE9复原值
    setAttr(elm, 'value', attrs.value)
  }
  //遍历老节点
  for (key in oldAttrs) {
    //如果新节点不存在 则去除
    if (isUndef(attrs[key])) {
      if (isXlink(key)) {
        elm.removeAttributeNS(xlinkNS, getXlinkProp(key))
      } else if (!isEnumeratedAttr(key)) {
        elm.removeAttribute(key)
      }
    }
  }
}



//设置attribute
function setAttr (el: Element, key: string, value: any) {
  //如果这个Attr 是boolean类型
  if (isBooleanAttr(key)) {
    // set attribute for blank value
    // e.g. <option disabled>Select one</option>
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, key)
    }
  } else if (isEnumeratedAttr(key)) {
    //如果是枚举类型
    el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true')
  } else if (isXlink(key)) {
    //如果是link
    if (isFalsyAttrValue(value)) {
      el.removeAttributeNS(xlinkNS, getXlinkProp(key))
    } else {
      el.setAttributeNS(xlinkNS, key, value)
    }
  } else {
    //isFalsyAttrValue 是否false值
    if (isFalsyAttrValue(value)) {
      el.removeAttribute(key)
    } else {
      //在这里设置attribute
      el.setAttribute(key, value)
    }
  }
}




export default {
  create: updateAttrs,
  update: updateAttrs
}
