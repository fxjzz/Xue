import { reactive } from '@xue/reactivity'
import { isObject } from '@xue/shared'

let uid = 0

export const createComponentInstance = vnode => {
  const type = vnode.type

  const instance = {
    uid: uid++,
    vnode,
    type,
    subTree: null,
    effect: null,
    update: null,
    render: null
  }

  return instance
}

export function setupComponent(instance) {
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  return finishComponentSetup(instance)
}

export function finishComponentSetup(instance) {
  const Component = instance.type

  instance.render = Component.render
  console.log('1', instance)
  applyOptions(instance)
}

function applyOptions(instance: any) {
  const { data: dataOptions } = instance.type
  if (dataOptions) {
    const data = dataOptions() //执行data函数拿到返回值
    if (isObject(data)) {
      instance.data = reactive(data)
    }
  }
}
