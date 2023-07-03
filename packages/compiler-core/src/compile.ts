import { isString } from '@xue/shared'
import { baseParse } from './parse'

export function baseCompile(template: string, options) {
  //
  //
  const ast = isString(template) ? baseParse(template, options) : template

  return
}
