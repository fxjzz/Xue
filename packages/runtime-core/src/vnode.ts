import { ShapeFlags, isArray, isFunction, isString } from '@xue/shared'

export interface VNode {
  __v_isVNode: true
  type: any
  props: any
  children: any
  shapeFlag: number
}

export function createVNode(type, props, children?): VNode {
  const shapeFlag = isString(type) ? ShapeFlags.TEXT_CHILDREN : 0
  return createBaseVNode(type, props, children, shapeFlag)
}

export const isVNode = (value: any): value is VNode => {
  return value && value.__v_isVNode ? true : false
}

function createBaseVNode(type, props, children, shapeFlag) {
  const vnode: VNode = {
    __v_isVNode: true,
    type,
    props,
    children,
    shapeFlag
  }

  normalizeChildren(vnode, children)
  return vnode
}

export function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0

  const { shapeFlag } = vnode
  if (children === null) {
    children = null
  } else if (isArray(children)) {
  } else if (typeof children === 'object') {
  } else if (isFunction(children)) {
  } else {
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  }

  vnode.children = children
  vnode.shapeFlag |= type
}
