import { extend, isString } from '@xue/shared'
import { baseParse } from './parse'
import { transform } from './transform'
import { transformElement } from './transforms/transformElement'
import { transformText } from './transforms/transformText'

export function baseCompile(template: string, options = {}) {
  //
  //
  const ast = isString(template) ? baseParse(template, options) : template
  console.log('ast', ast)

  transform(
    ast,
    extend(options, {
      //暂定
      nodeTransforms: [transformElement, transformText],
      directiveTransforms: extend({})
    })
  )

  return
}
