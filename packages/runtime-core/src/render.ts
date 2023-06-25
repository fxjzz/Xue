import { EMPTY_OBJ, ShapeFlags, isString } from '@xue/shared'
import {
  Comment,
  Fragment,
  Text,
  VNode,
  isSameVNodeType,
  normalizeVNode
} from './vnode'
import { createComponentInstance, setupComponent } from './component'
import { ReactiveEffect } from '@xue/reactivity'
import { queueJob } from './scheduler'
import { renderComponentRoot } from './componentRenderUtils'

export interface RendererOptions {
  patchProp(el, key, prev, next): void
  insert(el, container, anchor): void
  createElement(tag): void
  setElementText(el, text): void
  remove(el: Element): void
}

export function createRenderer(options: RendererOptions) {
  return baseCreateRenderer(options)
}

function baseCreateRenderer(options: RendererOptions): any {
  const {
    insert: hostInsert,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    remove: hostRemove
  } = options

  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      //挂载
      mountElement(n2, container, anchor)
    } else {
      //更新
      patchElement(n1, n2)
    }
  }

  const processComponent = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountComponent(n2, container, anchor)
    } else {
      //updateComponent()
    }
  }

  const mountComponent = (initialVNode, container, anchor) => {
    initialVNode.component = createComponentInstance(initialVNode)
    const instance = initialVNode.component

    setupComponent(instance)

    setupRenderEffect(instance, initialVNode, container, anchor)
  }

  const setupRenderEffect = (instance, initialVNode, container, anchor) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        const { bm, m } = instance

        if (bm) {
          bm()
        }
        const subTree = (instance.subTree = renderComponentRoot(instance))

        patch(null, subTree, container, anchor)

        initialVNode.el = subTree.el

        if (m) {
          m()
        }

        instance.isMounted = true
      } else {
        let { next, vnode } = instance
        if (!next) {
          next = vnode
        }

        const nextTree = renderComponentRoot(instance)
        const prevTree = instance.subTree

        instance.subTree = nextTree

        patch(prevTree, nextTree, container, anchor)

        next.el = nextTree.el
      }
    }

    const effect = (instance.effect = new ReactiveEffect(
      componentUpdateFn,
      () => {
        queueJob(update)
      }
    ))

    const update = (instance.update = () => effect.run())

    update()
  }

  const mountElement = (vnode, container, anchor) => {
    let el
    const { type, props, shapeFlag } = vnode
    el = vnode.el = hostCreateElement(type)

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, vnode.children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(vnode.children, el, anchor)
    }

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }

    hostInsert(el, container, anchor)
  }

  const mountChildren = (children, container, anchor) => {
    if (isString(children)) {
      children = children.split('')
    }

    for (let i = 0; i < children.length; i++) {
      const child = (children[i] = normalizeVNode(children[i]))
      patch(null, child, container, anchor)
    }
  }

  const patchElement = (n1, n2) => {
    const el = (n2.el = n1.el)

    const n1Props = n1.props || EMPTY_OBJ
    const n2Props = n2.props || EMPTY_OBJ

    //更新子节点
    patchChildren(n1, n2, el, null)

    //更新props
    patchProps(el, n2, n1Props, n2Props)
  }

  const patchChildren = (oldVNode, newVNode, container, anchor) => {
    // 旧节点的 children
    const c1 = oldVNode && oldVNode.children
    // 旧节点的 prevShapeFlag
    const prevShapeFlag = oldVNode ? oldVNode.shapeFlag : 0
    // 新节点的 children
    const c2 = newVNode.children

    // 新节点的 shapeFlag
    const { shapeFlag } = newVNode

    // 新子节点为 TEXT_CHILDREN
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // 旧子节点为 ARRAY_CHILDREN
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // TODO: 卸载旧子节点
      }
      // 新旧子节点不同
      if (c2 !== c1) {
        // 挂载新子节点的文本
        hostSetElementText(container, c2 as string)
      }
    } else {
      // 旧子节点为 ARRAY_CHILDREN
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        // 新子节点也为 ARRAY_CHILDREN
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // 这里要进行 diff 运算
          patchKeyedChildren(c1, c2, container, anchor)
        }
        // 新子节点不为 ARRAY_CHILDREN，则直接卸载旧子节点
        else {
          // TODO: 卸载
        }
      } else {
        // 旧子节点为 TEXT_CHILDREN
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          // 删除旧的文本
          hostSetElementText(container, '')
        }
        // 新子节点为 ARRAY_CHILDREN
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          // TODO: 单独挂载新子节点操作
        }
      }
    }
  }

  const patchProps = (el: Element, vnode, oldProps, newProps) => {
    // 新旧 props 不相同时才进行处理
    if (oldProps !== newProps) {
      // 遍历新的 props，依次触发 hostPatchProp ，赋值新属性
      for (const key in newProps) {
        const next = newProps[key]
        const prev = oldProps[key]
        if (next !== prev) {
          hostPatchProp(el, key, prev, next)
        }
      }
      // 存在旧的 props 时
      if (oldProps !== EMPTY_OBJ) {
        // 遍历旧的 props，依次触发 hostPatchProp ，删除不存在于新props 中的旧属性
        for (const key in oldProps) {
          if (!(key in newProps)) {
            hostPatchProp(el, key, oldProps[key], null)
          }
        }
      }
    }
  }

  const patchKeyedChildren = (c1, c2, container, parentAnchor) => {
    let i = 0
    const l2 = c2.length
    let e1 = c1.length - 1 //old node last下标
    let e2 = l2 - 1 //new node last下标

    // 1. 从头比对
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = (c2[i] = normalizeVNode(c2[i]))
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentAnchor)
      } else {
        break
      }
      i++
    }

    // 2. 尾
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1]
      const n2 = (c2[e2] = normalizeVNode(c2[e2]))
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentAnchor)
      } else {
        break
      }
      e1--
      e2--
    }

    // 3. mount
    // (a b)
    // (a b) b
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor
        while (i <= e2) {
          patch(null, normalizeVNode(c2[i]), container, anchor)
          i++
        }
      }
    }

    // 4. unmount
    // (a b) c
    // (a b)
    else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i])
        i++
      }
    }

    // 5. unknown sequence
  }

  const patch = (n1, n2: VNode, container, anchor = null) => {
    if (n1 === n2) {
      return
    }

    if (n1 && !isSameVNodeType(n1, n2)) {
      unmount(n1)
      n1 = null
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
          processComponent(n1, n2, container, anchor)
        }
    }
  }

  const unmount = vnode => {
    hostRemove(vnode.el)
  }

  const render = (vnode, container) => {
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode)
      }
    } else {
      patch(container._vnode || null, vnode, container)
    }

    container._vnode = vnode
  }

  return {
    render
  }
}
