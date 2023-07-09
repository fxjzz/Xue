//to create
//function render(){
//  return h()
//}
export function generate(node) {
  const context = createCodegenContext()

  genNode(node, context)

  return context.code
}

function createCodegenContext() {
  const context = {
    code: '',
    //缩进级别 (几个空格)
    indentLevel: 0,

    //代码拼接
    push(code) {
      context.code += code
    },

    //换行+缩进
    indent() {
      newline(++context.indentLevel)
    },
    //换行
    newline() {
      newline(context.indentLevel)
    },
    //换行+退格
    deIndent() {
      newline(--context.indentLevel)
    }
  }

  function newline(n: number) {
    context.push('\n' + `  `.repeat(n))
  }

  return context
}

function genNode(node, context) {
  switch (node.type) {
    case 'FunctionDecl':
      genFunctionDecl(node, context)
      break
    case 'ReturnStatement':
      genReturnStatement(node, context)
      break
    case 'CallExpression':
      genCallExpression(node, context)
      break
    case 'StringLiteral':
      genStringLiteral(node, context)
      break
    case 'ArrayExpression':
      genArrayExpression(node, context)
  }
}

function genFunctionDecl(node, context) {
  const { push, deIndent, indent } = context

  push(`function ${node.id.name}`)
  push('(')
  genNodeList(node.params, context)
  push(') {')
  indent()
  node.body.forEach(n => genNode(n, context))
  deIndent()
  push('}')
}

function genReturnStatement(node, context) {
  const { push } = context

  push('return ')
  genNode(node.return, context)
}

function genCallExpression(node, context) {
  const { push } = context
  const { args, callee } = node
  push(`${callee.name}`)
  push('(')

  genNodeList(args, context)
  push(')')
}

function genStringLiteral(node, context) {
  const { push } = context
  push(`'${node.value}'`)
}

function genArrayExpression(node, context) {
  const { push } = context
  push('[')
  genNodeList(node.elements, context)
  push(']')
}

function genNodeList(nodes, context) {
  const { push } = context
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    genNode(node, context)
    if (i < nodes.length - 1) {
      push(', ')
    }
  }
}
