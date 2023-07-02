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
  const children = parseChildren(context, TextModes.DATA, [])
  console.log(children)

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

  return nodes
}

function parseElement(context: ParserContext, ancestors: Array<any>) {
  const element = parseTag(context, TagType.Start)

  ancestors.push(element)
  const children = parseChildren(context, TextModes.DATA, ancestors)
  ancestors.pop()

  element.children = children

  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  }

  return element
}

function parseText(context: ParserContext, mode: TextModes) {
  const endTokens = ['<', '{{']

  let endIndex = context.source.length
  for (let i = 0; i < endTokens.length; i++) {
    const index = context.source.indexOf(endTokens[i], 1)
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }

  const content = parseTextData(context, endIndex, mode)

  return {
    type: NodeTypes.TEXT,
    content
  }
}

function parseTextData(
  context: ParserContext,
  length: number,
  mode: TextModes
) {
  const rawText = context.source.slice(0, length)
  advanceBy(context, length)

  return rawText
}

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
