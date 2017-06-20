/* @flow */



//接收插槽
/**
 * Runtime helper for resolving raw children VNodes into a slot object.
 */
export function resolveSlots (
  children: ?Array<VNode>,
  context: ?Component
): { [key: string]: Array<VNode> } {
  //初始化插槽
  const slots = {}
  //如果没有传入插槽节点 那么直接返回
  if (!children) {
    return slots
  }
  //建立一个默认插槽数组
  const defaultSlot = []
  //遍历传入插槽 虚拟节点数组
  for (let i = 0, l = children.length; i < l; i++) {
    //拿到插槽
    const child = children[i]
    // named slots should only be respected if the vnode was rendered in the
    // same context.
    //获取插槽上下文 如果插槽存在绑定数据 
    if ((child.context === context || child.functionalContext === context) &&
      child.data && child.data.slot != null
    ) {
      //获取插槽key
      const name = child.data.slot
      //拿到插槽数据
      const slot = (slots[name] || (slots[name] = []))
      //如果是模板 那么执行一下
      if (child.tag === 'template') {
        slot.push.apply(slot, child.children)
      } else {
        //如果不是 加入插槽队列
        slot.push(child)
      }
    } else {
      //直接加入插入
      defaultSlot.push(child)
    }
  }
  // ignore whitespace
  //如果默认插槽为空 那么赋值插槽默认
  if (!defaultSlot.every(isWhitespace)) {
    slots.default = defaultSlot
  }
  //返回插槽
  return slots
}



function isWhitespace (node: VNode): boolean {
  return node.isComment || node.text === ' '
}


export function resolveScopedSlots (
  fns: ScopedSlotsData, // see flow/vnode
  res?: Object
): { [key: string]: Function } {
  res = res || {}
  for (let i = 0; i < fns.length; i++) {
    if (Array.isArray(fns[i])) {
      resolveScopedSlots(fns[i], res)
    } else {
      res[fns[i].key] = fns[i].fn
    }
  }
  return res
}


