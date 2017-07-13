/* @flow */

import * as nodeOps from 'web/runtime/node-ops'
import { createPatchFunction } from 'core/vdom/patch'
import baseModules from 'core/vdom/modules/index'
import platformModules from 'web/runtime/modules/index'

//获取 ref 和directive module
// the directive module should be applied last, after all
// built-in modules have been applied.
const modules = platformModules.concat(baseModules)


//虚拟节点创建到真实DOM
export const patch: Function = createPatchFunction({ nodeOps, modules })





