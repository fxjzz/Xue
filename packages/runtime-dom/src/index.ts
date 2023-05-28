import { createRenderer } from '@xue/runtime-core'
import { extend } from '@xue/shared'
import { patchProp } from './patchProp'
import { nodeOps } from './nodeOps'

export * from './nodeOps'

let renderer

const rendererOptions = extend({ patchProp }, nodeOps)

function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions))
}

export const render = (...args) => {
  ensureRenderer().render(...args)
}
