/* not type checking this file because flow doesn't play well with Proxy */

import config from 'core/config'
import { warn, makeMap } from '../util/index'

let initProxy

if (process.env.NODE_ENV !== 'production') {
  const allowedGlobals = makeMap(
    'Infinity,undefined,NaN,isFinite,isNaN,' +
    'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
    'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
    'require' // for Webpack/Browserify
  )

  const warnNonPresent = (target, key) => {
    warn(
      `Property or method "${key}" is not defined on the instance but ` +
      `referenced during render. Make sure to declare reactive data ` +
      `properties in the data option.`,
      target
    )
  }

  const hasProxy =
    typeof Proxy !== 'undefined' &&
    Proxy.toString().match(/native code/)

  if (hasProxy) {
    const isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta')
    config.keyCodes = new Proxy(config.keyCodes, {
      set (target, key, value) {
        if (isBuiltInModifier(key)) {
          warn(`Avoid overwriting built-in modifier in config.keyCodes: .${key}`)
          return false
        } else {
          target[key] = value
          return true
        }
      }
    })
  }

  //调用这里时候
  const hasHandler = {
    has (target, key) {
      // target = vue
      // key 传入的target属性
      // 这里的key 是渲染时传入的vue原型方法缩写方法 \src\core\instance\state.js中
      const has = key in target
      const isAllowed = allowedGlobals(key) || key.charAt(0) === '_'
      //如果存在 并且 是允许执行  不是则报错
      if (!has && !isAllowed) {
        warnNonPresent(target, key)
      }
      //返回 boolen
      return has || !isAllowed
    }
  }

  const getHandler = {
    get (target, key) {
      if (typeof key === 'string' && !(key in target)) {
        warnNonPresent(target, key)
      }
      return target[key]
    }
  }



  //初始化代理 proxy
  // var test = new Proxy(target,handle)
  // 调用 test = XXX 也为 target = XXX;
  // handle 传入为set的话
  initProxy = function initProxy (vm) {
    if (hasProxy) {
      // determine which proxy handler to use
      const options = vm.$options
      //如果 vm.options.render 已经存在 则getHandler 不然则hasHandler
      const handlers = options.render && options.render._withStripped
        ? getHandler
        : hasHandler
      //代理自己
      vm._renderProxy = new Proxy(vm, handlers)
    } else {
      vm._renderProxy = vm
    }
  }
}



export { initProxy }


