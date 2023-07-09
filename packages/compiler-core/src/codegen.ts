import { isString } from '@xue/shared'
import { NodeTypes } from './ast'

//to create
//function render(){
//  return h()
//}
export function generate(ast) {
  const context = createCodegenContext(ast)
  const { push, indent } = context
  push(`function renter(_ctx,_cache) {`)
  indent()
  push(`return `)
  if (ast.codegenNode) {
    genNode(ast.codegenNode, context)
  }

  return context.code
}

function createCodegenContext(ast) {
  const context = {
    code: '',
    //缩进级别 (几个空格)
    indentLevel: 0,

    //代码拼接
    push(code) {
      context.code += code
    },

    indent() {
      newline(++context.indentLevel)
    },
    newline() {
      newline(context.indentLevel)
    }
  }

  function newline(n: number) {
    context.push('\n' + `  `.repeat(n))
  }

  return context
}

function genNode(node, context) {
  if (isString(node)) {
    context.push(node)
    return
  }

  switch (node.type) {
    case NodeTypes.VNODE_CALL:
      genVNodeCall(node, context)
      break
  }
}

function genVNodeCall(node, context) {
  const { tag, children, props } = node
  genNodeList([tag, props, children], context)
}

function genNodeList(nodes, context) {
  const { push, newline } = context
}
