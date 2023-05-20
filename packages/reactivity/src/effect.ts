import { ComputedRefImpl } from './computed'
import { Dep, createDep } from './dep'

type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

export type EffectScheduler = (...args: any[]) => any

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  computed?: ComputedRefImpl<T>

  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null
  ) {}
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
      depsMap.set(key, (dep = createDep()))
    }

    const eventInfo = { effect: activeEffect, target, key }
    trackEffects(dep, eventInfo)
  }
}
export function trackEffects(dep: Dep, eventInfo?) {
  dep.add(activeEffect!)
}

export function trigger(target: object, key: unknown, value: unknown) {
  const depsMap = targetMap.get(target)

  if (depsMap) {
    let dep: Dep | undefined = depsMap.get(key)
    if (dep) {
      triggerEffects(dep)
    }
  }
}

export function triggerEffects(dep: Dep) {
  const effects = Array.isArray(dep) ? dep : [...dep]
  for (const effect of effects) {
    triggerEffect(effect)
  }
}

export function triggerEffect(effect: ReactiveEffect) {
  if (effect.scheduler) {
    effect.scheduler()
  } else {
    effect.run()
  }
}
