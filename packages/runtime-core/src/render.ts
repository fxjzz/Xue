import { ShapeFlags } from '@xue/shared'
import { Comment, Fragment, Text, VNode } from './vnode'

export interface RendererOptions {
  patchProp(el, key, prev, next): void
  insert(el, container, anchor): void
  remove(): void
  createElement(tag): void
  setElementText(el, text): void
}

export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options: RendererOptions): any {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText
  } = options

  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountElement(n2, container, anchor)
    } else {
      //patch
    }
  }

  const mountElement = (vnode, container, anchor) => {
    let el
    const { type, props, shapeFlag } = vnode
    el = vnode.el = hostCreateElement(type)

    if (shapeFlag & ShapeFlags.ELEMENT) {
      hostSetElementText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    }

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    hostInsert(el, container, anchor)
  }

  const patch = (n1, n2: VNode, container, anchor = null) => {
    if (n1 === n2) {
      return
    }
    const { type, shapeFlag } = n2
    switch (type) {
      case Text:
        break
      case Comment:
        break
      case Fragment:
        break
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor)
        } else if (shapeFlag & ShapeFlags.COMPONENT) {
        }
    }
  }

  const render = (vnode, container) => {
    if (vnode == null) {
    } else {
      patch(container._vnode || null, vnode, container)
    }

    container._vnode = vnode
  }

  return {
    render
  }
}
