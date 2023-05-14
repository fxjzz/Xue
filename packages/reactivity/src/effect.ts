import { createDep } from './dep'

type KeyToDepMap = Map<any, ReactiveEffect>
const targetMap = new WeakMap<any, KeyToDepMap>()

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  constructor(public fn: () => T) {}
  run() {
    activeEffect = this
    return this.fn()
  }
  stop() {}
}

export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)
  _effect.run()
}

export function track(target: object, key: unknown) {
  if (activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, activeEffect)
    }
  }
}

export function trigger(target: object, key: unknown, value: unknown) {
  console.log('触发依赖')
  console.log(target, key, value)

  const depsMap = targetMap.get(target)
  if (depsMap) {
    let effect = depsMap.get(key)
    if (effect) {
      effect.run()
    }
  }
}
