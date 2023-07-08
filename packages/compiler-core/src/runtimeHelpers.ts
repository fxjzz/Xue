export const CREATE_ELEMENT_VNODE = Symbol(`createElementVNode`)
export const CREATE_VNODE = Symbol(`createVNode`)

export const helperNameMap: Record<symbol, string> = {
  [CREATE_VNODE]: `createVNode`,
  [CREATE_ELEMENT_VNODE]: `createElementVNode`
}
