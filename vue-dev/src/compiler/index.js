/* @flow */

import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'
import { createCompilerCreator } from './create-compiler'

// `createCompilerCreator` allows creating compilers that use alternative
// parser/optimizer/codegen, e.g the SSR optimizing compiler.
// Here we just export a default compiler using the default parts.

//创建编译函数
//传入基础编译函数baseCompile
//baseCompile 接收2个参数
//模板字符串 和编译配置
export const createCompiler = createCompilerCreator(function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  //解析
  //传入模板字符串去除空格
  //传入配置
  //获得ast 虚拟元素
  const ast = parse(template.trim(), options)
  //性能处理
  //加入缓存
  optimize(ast, options)
  //开始生成code 
  /*
    state = new CodegenState(options)
    code={
      render: `with(this){return "_c('div',{attrs:{"id":"app"}}),[_v("\n "+_s(message)+"\n ")]" }`,
      staticRenderFns: state.staticRenderFns
    }
  */
  const code = gnerate(ast, options)
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
})



