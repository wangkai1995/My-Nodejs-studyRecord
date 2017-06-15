/* @flow */

import type Watcher from './watcher'
import { remove } from '../util/index'

//全局属性唯一ID
let uid = 0

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 */

 //辅助绑定对象
export default class Dep {
  //初始化静态参数 目标对象watcher
  //传入的唯一ID
  //watcher数组
  static target: ?Watcher;
  id: number;
  subs: Array<Watcher>;


  //每次调用的时候
  constructor () {
    //唯一ID+++
    this.id = uid++
    //创建观察数组
    this.subs = []
  }

  //观察数组添加观察对象
  addSub (sub: Watcher) {
    //观察对象watcher
    this.subs.push(sub)
  }


  //从观察数组中删除观察对象
  removeSub (sub: Watcher) {
    remove(this.subs, sub)
  }


  //添加观察对象
  depend () {
    //如果目标存在
    if (Dep.target) {
      //添加自己
      Dep.target.addDep(this)
    }
  }

  //通知
  notify () {
    // stabilize the subscriber list first
    //转变成数组
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      //执行watcher.update方法
      subs[i].update()
    }
  }
}



// the current target watcher being evaluated.
// this is globally unique because there could be only one
// watcher being evaluated at any time.

//全局对象 唯一一个
//用来 watcher对象添加目标
Dep.target = null
//目标栈数组
const targetStack = []

//将老的目标压入目标栈
//赋值最新的栈
export function pushTarget (_target: Watcher) {
  if (Dep.target) targetStack.push(Dep.target)
  Dep.target = _target
}



//弹出目标对象 
//赋值自己
export function popTarget () {
  Dep.target = targetStack.pop()
}


