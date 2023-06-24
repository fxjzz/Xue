import {
  ShapeFlags,
  isArray,
  isFunction,
  isObject,
  isString,
  normalizeClass
} from '@xue/shared'

export const Fragment = Symbol('fragment')
export const Text = Symbol('text')
export const Comment = Symbol('comment')

export interface VNode {
  __v_isVNode: true
  type: any
  props: any
  children: any
  shapeFlag: number
  key: any
}

export function normalizeVNode(child) {
  if (typeof child === 'object') {
    return child
  } else {
    return createVNode(Text, null, String(child))
  }
}

export function createVNode(type, props, children?): VNode {
  if (props) {
    let { class: klass, style } = props
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass)
    }
  }

  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0

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
    shapeFlag,
    key: props?.key || null
  }

  normalizeChildren(vnode, children)
  return vnode
}

export function normalizeChildren(vnode: VNode, children: unknown) {
  let type = 0

  const { shapeFlag } = vnode
  if (children == null) {
    children = null
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else if (typeof children === 'object') {
  } else if (isFunction(children)) {
  } else {
    children = String(children)
    type = ShapeFlags.TEXT_CHILDREN
  }

  vnode.children = children
  vnode.shapeFlag |= type
}

export function isSameVNodeType(n1: VNode, n2: VNode) {
  return n1.type == n2.type && n1.key == n2.key
}
