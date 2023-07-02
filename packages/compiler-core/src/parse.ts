export interface ParserContext {
  source: string
}

function createParserContext(content: string): ParserContext {
  return {
    source: content
  }
}

export function baseParse(content: string, options) {
  const context = createParserContext(content)
  return {}
}
