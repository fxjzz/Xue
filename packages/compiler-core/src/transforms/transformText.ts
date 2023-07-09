import {
  NodeTypes,
  createCompoundExpression,
  createStringLiteral
} from '../ast'

export const transformText = (node, context) => {
  if (!NodeTypes.ELEMENT) {
    return
  }

  node.jsNode = createStringLiteral(node.content)
}
