/* @flow */

import { extend, warn } from 'core/util/index'

/**
 * Runtime helper for rendering <slot>
 */

/**
  第一个参数是插槽名
  第二个参数虚拟节点
  第三个参数是属性
  第四个参数是绑定属性对象
**/
export function renderSlot (
  name: string,
  fallback: ?Array<VNode>,
  props: ?Object,
  bindObject: ?Object
): ?Array<VNode> {
  const scopedSlotFn = this.$scopedSlots[name]
  //获取作用于插槽
  if (scopedSlotFn) { // scoped slot
    //拿到属性
    props = props || {}
    //绑定对象如果存在
    if (bindObject) {
      //获取绑定数据的参数
      extend(props, bindObject)
    }
    //返回插槽节点
    return scopedSlotFn(props) || fallback
  } else {
    //不存在则直接获取插槽
    const slotNodes = this.$slots[name]
    //报错在返回获取到的插槽
    // warn duplicate slot usage
    if (slotNodes && process.env.NODE_ENV !== 'production') {
      slotNodes._rendered && warn(
        `Duplicate presence of slot "${name}" found in the same render tree ` +
        `- this will likely cause render errors.`,
        this
      )
      slotNodes._rendered = true
    }
    return slotNodes || fallback
  }
}



