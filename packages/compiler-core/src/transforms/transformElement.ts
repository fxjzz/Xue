import {
  NodeTypes,
  createArrayExpression,
  createCallExpress,
  createStringLiteral,
  createVNodeCall
} from '../ast'

export const transformElement = (node, context) => {
  return function postTransformElement() {
    node = context.currentNode!

    if (node.type !== NodeTypes.ELEMENT) {
      return
    }

    const { tag, props } = node

    let vnodeTag = `"${tag}"`
    let vnodeProps = []
    let vnodeChildren = node.children

    node.codegenNode = createVNodeCall(
      context,
      vnodeTag,
      vnodeProps,
      vnodeChildren
    )

    //jsNode
    const callExp = createCallExpress('h', [createStringLiteral(node.tag)])
    node.children.length === 1
      ? callExp.args.push(node.children[0].jsNode)
      : callExp.args.push(
          createArrayExpression(node.children.map(c => c.jsNode))
        )

    node.jsNode = callExp
  }
}
