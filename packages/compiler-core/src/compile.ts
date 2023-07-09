import { extend, isString } from '@xue/shared'
import { baseParse } from './parse'
import { transform } from './transform'
import { transformElement } from './transforms/transformElement'
import { transformText } from './transforms/transformText'
import { generate } from './codegen'
import { transformRoot } from './transforms/transformRoot'

export function baseCompile(template: string, options = {}) {
  //
  //
  const ast = isString(template) ? baseParse(template, options) : template

  transform(
    ast,
    extend(options, {
      //暂定
      nodeTransforms: [transformRoot, transformElement, transformText],
      directiveTransforms: extend({})
    })
  )
  console.log('ast1', ast)

  return generate(ast)
}
