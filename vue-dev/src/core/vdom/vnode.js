/* @flow */


// 虚拟节点构造类
export default class VNode {
  tag: string | void;
  data: VNodeData | void;
  children: ?Array<VNode>;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  context: Component | void; // rendered in this component's scope
  functionalContext: Component | void; // only for functional component root nodes
  key: string | number | void;
  componentOptions: VNodeComponentOptions | void;
  componentInstance: Component | void; // component instance
  parent: VNode | void; // component placeholder node
  raw: boolean; // contains raw HTML? (server only)
  isStatic: boolean; // hoisted static node
  isRootInsert: boolean; // necessary for enter transition check
  isComment: boolean; // empty comment placeholder?
  isCloned: boolean; // is a cloned node?
  isOnce: boolean; // is a v-once node?
  asyncFactory: ?Function; // async component factory function
  asyncMeta: ?Object;
  isAsyncPlaceholder: boolean;
  ssrContext: ?Object;

  constructor (
    tag?: string,         //传入标签名
    data?: VNodeData,     //传入虚拟节点数据
    children?: ?Array<VNode>,  //子元素数组
    text?: string,        //文本
    elm?: Node,           //虚拟节点
    context?: Component,  //上下文
    componentOptions?: VNodeComponentOptions,    //虚拟节点配置
    asyncFactory?: Function   //异步构造函数
  ) {
    //初始化一系列属性标签
    //标签名
    this.tag = tag
    //attribute
    this.data = data
    //子元素
    this.children = children
    //纯文本
    this.text = text
    //真实节点
    this.elm = elm
    //这个不清除
    this.ns = undefined
    //上下文
    this.context = context
    //上下文函数
    this.functionalContext = undefined
    //唯一标示key
    this.key = data && data.key
    //组件配置
    this.componentOptions = componentOptions
    //组件实例
    this.componentInstance = undefined
    //父节点
    this.parent = undefined
    //未处理表示
    this.raw = false
    //是否静态
    this.isStatic = false
    //是否根节点插入
    this.isRootInsert = true
    //是否注释
    this.isComment = false
    //是否复制
    this.isCloned = false
    //是否是单次
    this.isOnce = false
    //异步生产
    this.asyncFactory = asyncFactory
    //异步变化
    this.asyncMeta = undefined
    //是否异步占位符
    this.isAsyncPlaceholder = false
  }

  // DEPRECATED: alias for componentInstance for backwards compat.
  /* istanbul ignore next */
  get child (): Component | void {
    return this.componentInstance
  }
}



export const createEmptyVNode = () => {
  const node = new VNode()
  node.text = ''
  node.isComment = true
  return node
}


//创建虚拟文本节点
export function createTextVNode (val: string | number) {
  return new VNode(undefined, undefined, undefined, String(val))
}


//复制虚拟节点
// optimized shallow clone
// used for static nodes and slot nodes because they may be reused across
// multiple renders, cloning them avoids errors when DOM manipulations rely
// on their elm reference.
export function cloneVNode (vnode: VNode): VNode {
  const cloned = new VNode(
    vnode.tag,
    vnode.data,
    vnode.children,
    vnode.text,
    vnode.elm,
    vnode.context,
    vnode.componentOptions
  )
  cloned.ns = vnode.ns
  cloned.isStatic = vnode.isStatic
  cloned.key = vnode.key
  cloned.isComment = vnode.isComment
  cloned.isCloned = true
  return cloned
}


//复制虚拟节点数组
export function cloneVNodes (vnodes: Array<VNode>): Array<VNode> {
  const len = vnodes.length
  const res = new Array(len)
  for (let i = 0; i < len; i++) {
    res[i] = cloneVNode(vnodes[i])
  }
  return res
}


