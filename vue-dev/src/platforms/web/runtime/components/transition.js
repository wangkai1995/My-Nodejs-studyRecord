/* @flow */

// Provides transition support for a single element/component.
// supports transition mode (out-in / in-out)

import { warn } from 'core/util/index'
import { camelize, extend, isPrimitive } from 'shared/util'
import { mergeVNodeHook, getFirstComponentChild } from 'core/vdom/helpers/index'

export const transitionProps = {
  name: String,
  appear: Boolean,
  css: Boolean,
  mode: String,
  type: String,
  enterClass: String,
  leaveClass: String,
  enterToClass: String,
  leaveToClass: String,
  enterActiveClass: String,
  leaveActiveClass: String,
  appearClass: String,
  appearActiveClass: String,
  appearToClass: String,
  duration: [Number, String, Object]
}

//处理抽象组件
// in case the child is also an abstract component, e.g. <keep-alive>
// we want to recursively retrieve the real component to be rendered
function getRealChild (vnode: ?VNode): ?VNode {
  const compOptions: ?VNodeComponentOptions = vnode && vnode.componentOptions
  if (compOptions && compOptions.Ctor.options.abstract) {
    return getRealChild(getFirstComponentChild(compOptions.children))
  } else {
    return vnode
  }
}



export function extractTransitionData (comp: Component): Object {
  const data = {}
  const options: ComponentOptions = comp.$options
  // props
  for (const key in options.propsData) {
    data[key] = comp[key]
  }
  // events.
  // extract listeners and pass them directly to the transition methods
  const listeners: ?Object = options._parentListeners
  for (const key in listeners) {
    data[camelize(key)] = listeners[key]
  }
  return data
}



function placeholder (h: Function, rawChild: VNode): ?VNode {
  if (/\d-keep-alive$/.test(rawChild.tag)) {
    return h('keep-alive', {
      props: rawChild.componentOptions.propsData
    })
  }
}


//判断父节点是否是transition
function hasParentTransition (vnode: VNode): ?boolean {
  while ((vnode = vnode.parent)) {
    if (vnode.data.transition) {
      return true
    }
  }
}



function isSameChild (child: VNode, oldChild: VNode): boolean {
  return oldChild.key === child.key && oldChild.tag === child.tag
}



function isAsyncPlaceholder (node: VNode): boolean {
  return node.isComment && node.asyncFactory
}




//transtion指令
//render 生成格式  = _f(xxx);

export default {
  name: 'transition',
  props: transitionProps,
  abstract: true,

  render (h: Function) {

    let children: ?Array<VNode> = this.$options._renderChildren
    // 获取子节点，没有则返回 渲染一个空节点‘
    // 这里包含 v-if的 所以可能为空
    if (!children) {
      return
    }

    //过滤子节点 主要是文本节点
    // filter out text nodes (possible whitespaces)
    children = children.filter((c: VNode) => c.tag || isAsyncPlaceholder(c))
    /* istanbul ignore if */
    if (!children.length) {
      return
    }

    // warn multiple elements
    // 子节点唯一 不能超过1个
    if (process.env.NODE_ENV !== 'production' && children.length > 1) {
      warn(
        '<transition> can only be used on a single element. Use ' +
        '<transition-group> for lists.',
        this.$parent
      )
    }


    const mode: string = this.mode

    // warn invalid mode
    if (process.env.NODE_ENV !== 'production' &&
      mode && mode !== 'in-out' && mode !== 'out-in'
    ) {
      warn(
        'invalid <transition> mode: ' + mode,
        this.$parent
      )
    }


    //获取到子节点
    const rawChild: VNode = children[0]

    // 这里判断当前transition 组件不能为根组件 父组件也不能是transition组件
    // if this is a component root node and the component's
    // parent container node also has transition, skip.
    if (hasParentTransition(this.$vnode)) {
      return rawChild
    }

    //处理数据和子节点
    //处理 忽略抽象组件
    // apply transition data to child
    // use getRealChild() to ignore abstract components e.g. keep-alive
    const child: ?VNode = getRealChild(rawChild)
    /* istanbul ignore if */
    if (!child) {
      return rawChild
    }

    if (this._leaving) {
      return placeholder(h, rawChild)
    }


    //确保 transition独特的 虚拟节点类型
    //组件实例将要使用  remove pending leaving 节点
    //在进入期间
    // ensure a key that is unique to the vnode type and to this transition
    // component instance. This key will be used to remove pending leaving nodes
    // during entering.
    // 给子节点生成唯一KEY
    const id: string = `__transition-${this._uid}-`
    child.key = child.key == null
      ? child.isComment
        ? id + 'comment'
        : id + child.tag
      : isPrimitive(child.key)
        ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
        : child.key

    //处理transition数据 props等
    const data: Object = (child.data || (child.data = {})).transition = extractTransitionData(this)
    //获取旧节点
    const oldRawChild: VNode = this._vnode
    const oldChild: VNode = getRealChild(oldRawChild)

    // 标记一下子节点 v-show指令
    // mark v-show
    // so that the transition module can hand over the control to the directive
    if (child.data.directives && child.data.directives.some(d => d.name === 'show')) {
      child.data.show = true
    }


    //判断老节点状态是否更新
    if (
      oldChild &&
      oldChild.data &&
      !isSameChild(child, oldChild) &&
      !isAsyncPlaceholder(oldChild)
    ) {

      // 如果子节点需要更新
      // replace old child transition data with fresh one
      // important for dynamic transitions!
      const oldData: Object = oldChild && (oldChild.data.transition = extend({}, data))
      // handle transition mode
      // 处理移动模式 开始加速结束慢速   开始慢速结束加速
      if (mode === 'out-in') {
        // return placeholder node and queue update when leave finishes
        // 开始加速结束慢速
        this._leaving = true
        // 出发准备离开钩子
        mergeVNodeHook(oldData, 'afterLeave', () => {
          this._leaving = false
          this.$forceUpdate()
        })
        return placeholder(h, rawChild)
      } else if (mode === 'in-out') {
        //开始慢速结束加速
        //准备开始离开
        if (isAsyncPlaceholder(child)) {
          return oldRawChild
        }
        let delayedLeave
        const performLeave = () => { delayedLeave() }
        mergeVNodeHook(data, 'afterEnter', performLeave)
        mergeVNodeHook(data, 'enterCancelled', performLeave)
        mergeVNodeHook(oldData, 'delayLeave', leave => { delayedLeave = leave })
      }
    }

    return rawChild
  }
}











