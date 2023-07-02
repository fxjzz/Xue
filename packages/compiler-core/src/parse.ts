import { isArray } from '@xue/shared'
import { ElementTypes, NodeTypes } from './ast'

export const enum TextModes {
  DATA,
  RCDATA,
  RAWTEXT,
  CDATA,
  ATTRIBUTE_VALUE
}

const enum TagType {
  Start,
  End
}

export interface ParserContext {
  source: string
}

function createParserContext(content: string): ParserContext {
  //还有偏移量 等等
  //核心就是一个source
  return {
    source: content
  }
}

export function baseParse(content: string, options) {
  const context = createParserContext(content)
  parseChildren(context, TextModes.DATA, [])

  return {}
}

function parseChildren(context: ParserContext, mode: TextModes, ancestors) {
  //todo: parent

  const nodes = []

  while (!isEnd(context, mode, ancestors)) {
    const s = context.source
    let node

    if (mode === TextModes.DATA || mode === TextModes.RCDATA) {
      if (startsWith(s, '{{')) {
        //'{{'
      } else if (mode === TextModes.DATA && s[0] === '<') {
        if (s.length === 1) {
        } else if (s[1] === '!') {
        } else if (s[1] === '/') {
        } else if (/[a-z]/i.test(s[1])) {
          node = parseElement(context, ancestors)
        }
      }
    }

    if (!node) {
      node = parseText(context, mode)
    }

    if (isArray(node)) {
      //
    } else {
      pushNode(nodes, node)
    }
  }
}

function parseElement(context: ParserContext, ancestors) {
  const element = parseTag(context, TagType.Start)
}

function parseText(context: ParserContext, mode) {}

function parseTag(context: ParserContext, type: TagType) {
  const match = /^<\/?([a-z][^\t\r\n\f />]*)/i.exec(context.source)!

  const tag = match[1]

  advanceBy(context, match[0].length)
  //advanceSpaces(context)

  //Tag close
  let isSelfClosing = false
  isSelfClosing = startsWith(context.source, '/>')
  if (type === TagType.End && isSelfClosing) {
    console.log('err')
  }
  advanceBy(context, isSelfClosing ? 2 : 1)

  if (type === TagType.End) {
    return
  }

  return {
    type: NodeTypes.ELEMENT,
    tag,
    children: [],
    tagType: ElementTypes.ELEMENT,
    props: []
  }
}

function isEnd(context: ParserContext, mode: TextModes, ancestors) {
  const s = context.source

  switch (mode) {
    case TextModes.DATA:
      if (startsWith(s, '</')) {
        // TODO: probably bad performance
        for (let i = ancestors.length - 1; i >= 0; --i) {
          if (startsWithEndTagOpen(s, ancestors[i].tag)) {
            return true
          }
        }
      }
      break

    //todo:case
  }

  return !s
}

function startsWith(source: string, searchString: string): boolean {
  return source.startsWith(searchString)
}

function startsWithEndTagOpen(source: string, tag: string): boolean {
  return (
    startsWith(source, '</') &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase() &&
    /[\t\r\n\f />]/.test(source[2 + tag.length] || '>')
  )
}

function pushNode(nodes, node): void {
  nodes.push(node)
}

function advanceBy(context: ParserContext, numOfCharacters: number) {
  const { source } = context
  //todo:offset

  //裁剪
  context.source = source.slice(numOfCharacters)
}

function advanceSpaces(context: ParserContext) {
  const match = /^[\t\r\n\f ]+/.exec(context.source)
  if (match) {
    advanceBy(context, match[0].length)
  }
}
