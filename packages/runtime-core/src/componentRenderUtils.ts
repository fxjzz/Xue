import { ShapeFlags } from '@xue/shared'
import { normalizeVNode } from './vnode'

export function renderComponentRoot(instance) {
  const { vnode, render, data } = instance

  let result

  try {
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
      result = normalizeVNode(render.call(data))
    } else {
    }
  } catch (error) {
    console.error(error)
  }

  return result
}
