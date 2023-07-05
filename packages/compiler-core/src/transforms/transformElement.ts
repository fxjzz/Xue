export const transformElement = (node, context) => {
  return function postTransformElement() {
    node = context.currentNode!
  }
}
