import { isOn } from '@xue/shared'
import { patchClass } from './modules/class'

export const patchProp = (el: Element, key, prev, next) => {
  if (key === 'class') {
    patchClass(el, next)
  } else if (key === 'style') {
  } else if (isOn(key)) {
  }
}
