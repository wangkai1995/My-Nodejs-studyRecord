/* @flow */

import {
  no,
  noop,
  identity
} from 'shared/util'

import { LIFECYCLE_HOOKS } from 'shared/constants'

export type Config = {
  // user
  optionMergeStrategies: { [key: string]: Function };
  silent: boolean;
  productionTip: boolean;
  performance: boolean;
  devtools: boolean;
  errorHandler: ?(err: Error, vm: Component, info: string) => void;
  ignoredElements: Array<string>;
  keyCodes: { [key: string]: number | Array<number> };

  // platform
  isReservedTag: (x?: string) => boolean;
  isReservedAttr: (x?: string) => boolean;
  parsePlatformTagName: (x: string) => string;
  isUnknownElement: (x?: string) => boolean;
  getTagNamespace: (x?: string) => string | void;
  mustUseProp: (tag: string, type: ?string, name: string) => boolean;

  // legacy
  _lifecycleHooks: Array<string>;
};

export default ({
  // 属性合并策略
  /**
   * Option merge strategies (used in core/util/options)
   */
  optionMergeStrategies: Object.create(null),
  // 作废和警告标志
  /**
   * Whether to suppress warnings.
   */
  silent: false,
  //不是开发环境
  /**
   * Show production mode tip message on boot?
   */
  productionTip: process.env.NODE_ENV !== 'production',
  //开发标志
  /**
   * Whether to enable devtools
   */
  devtools: process.env.NODE_ENV !== 'production',
  //性能标志
  /**
   * Whether to record perf
   */
  performance: false,
  //错误处理
  /**
   * Error handler for watcher errors
   */
  errorHandler: null,
  //忽略创建自定义节点
  /**
   * Ignore certain custom elements
   */
  ignoredElements: [],
  //VM自己定义属性别名
  /**
   * Custom user key aliases for v-on
   */
  keyCodes: Object.create(null),
  //是否保留不能注册标签
  /**
   * Check if a tag is reserved so that it cannot be registered as a
   * component. This is platform-dependent and may be overwritten.
   */
  isReservedTag: no,
  //是否保留不能注册属性
  /**
   * Check if an attribute is reserved so that it cannot be used as a component
   * prop. This is platform-dependent and may be overwritten.
   */
  isReservedAttr: no,
  //是否是未知属性
  /**
   * Check if a tag is an unknown element.
   * Platform-dependent.
   */
  isUnknownElement: no,
  //获取标签命名
  /**
   * Get the namespace of an element
   */
  getTagNamespace: noop,
  //获取特定标签名
  /**
   * Parse the real tag name for the specific platform.
   */
  parsePlatformTagName: identity,
  //确定必须使用属性
  /**
   * Check if an attribute must be bound using property, e.g. value
   * Platform-dependent.
   */
  mustUseProp: no,
  //生命周期钩子
  /**
   * Exposed for legacy reasons
   */
  _lifecycleHooks: LIFECYCLE_HOOKS
}: Config)
