import { reactive } from '@xue/reactivity'
import { isFunction, isObject } from '@xue/shared'
import { onBeforeMount, onMounted } from './apiLifecycle'

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
    render: null,
    isMounted: false,
    c: null,
    bm: null,
    m: null
  }

  return instance
}

export function setupComponent(instance) {
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
  const Component = instance.type
  const { setup } = Component

  if (setup) {
    const setupResult = setup()
    handleSetupResult(instance, setupResult)
  } else {
    finishComponentSetup(instance)
  }
}

export function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    // ()=>h()
    instance.render = setupResult
  } else if (isObject(setupResult)) {
    // { x }
  }

  finishComponentSetup(instance)
}

export function finishComponentSetup(instance) {
  const Component = instance.type

  if (!instance.render) {
    instance.render = Component.render
  }

  applyOptions(instance)
}

function applyOptions(instance: any) {
  const { data: dataOptions, created, beforeMount, mounted } = instance.type

  if (dataOptions) {
    const data = dataOptions() //执行data函数拿到返回值
    if (isObject(data)) {
      instance.data = reactive(data)
    }
  }

  if (created) {
    callHook(created, instance.data)
  }

  function registerLifecycleHook(register: Function, hook?: Function) {
    register(hook?.bind(instance.data), instance)
  }

  registerLifecycleHook(onBeforeMount, beforeMount)
  registerLifecycleHook(onMounted, mounted)
}

function callHook(hook: Function, proxy) {
  hook.call(proxy)
}
