import { isArray, isString } from '@xue/shared'

export function createTransformContext(
  root,
  { nodeTransforms = [], directiveTransforms = {} }
) {
  const context = {
    nodeTransforms,
    directiveTransforms,

    //state
    root,
    helpers: new Map(),
    parent: null,
    currentNode: root,
    childIndex: 0,

    helper(name) {
      const count = context.helpers.get(name) || 0
      context.helpers.set(name, count + 1)
      return name
    }
  }

  return context
}

export function transform(root, options) {
  const context = createTransformContext(root, options)

  traverseNode(root, context)
}

export function traverseNode(node, context) {
  context.currentNode = node

  const { nodeTransforms } = context
  const exitFns: Array<any> = []

  for (let i = 0; i < nodeTransforms.length; i++) {
    const onExit = nodeTransforms[i](node, context)
    if (onExit) {
      if (isArray(onExit)) {
        exitFns.push(...onExit)
      } else {
        exitFns.push(onExit)
      }
    }

    if (!context.currentNode) {
      return
    } else {
      node = context.currentNode
    }
  }

  //深度遍历所有child
  traverseChildren(node, context)

  context.currentNode = node
  //执行回调函数
  let i = exitFns.length
  while (i--) {
    exitFns[i]()
  }
}

export function traverseChildren(parent, context) {
  let i = 0

  for (; i < parent.children.length; i++) {
    const child = parent.children[i]
    if (isString(child)) continue

    context.parent = parent
    context.childIndex = i
    traverseNode(child, context)
  }
}
