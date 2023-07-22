import { extend } from '@xue/shared'
import { ComputedRefImpl, computed } from './computed'
import { Dep, createDep } from './dep'

type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any, KeyToDepMap>()

export interface ReactiveEffectOptions {
  lazy?: boolean
  scheduler?: EffectScheduler
}

export type EffectScheduler = (...args: any[]) => any

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T = any> {
  computed?: ComputedRefImpl<T>
  parent: ReactiveEffect | undefined = undefined

  deps: Dep[] = []
  constructor(
    public fn: () => T,
    public scheduler: EffectScheduler | null = null
  ) {}
  run() {
    let parent: ReactiveEffect | undefined = activeEffect
    // while (parent) {
    //   if (parent === this) {
    //     return
    //   }
    //   parent = parent.parent
    // }

    try {
      this.parent = activeEffect
      activeEffect = this
      cleanupEffect(this)
      return this.fn()
    } finally {
      activeEffect = this.parent
      this.parent = undefined
    }
  }
  stop() {}
}

function cleanupEffect(effect: ReactiveEffect) {
  const { deps } = effect
  for (let i = 0; i < deps.length; i++) {
    deps[i].delete(effect)
  }
  deps.length = 0
}

export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions) {
  const _effect = new ReactiveEffect(fn)
  if (options) {
    extend(_effect, options)
  }
  if (!options || !options.lazy) {
    _effect.run()
  }
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
  activeEffect!.deps.push(dep)
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
  //const effects = dep (bug)
  const effects = Array.isArray(dep) ? dep : [...dep]
  for (const effect of effects) {
    if (effect.computed) {
      triggerEffect(effect)
    }
  }
  for (const effect of effects) {
    if (!effect.computed) {
      triggerEffect(effect)
    }
  }
}

export function triggerEffect(effect: ReactiveEffect) {
  if (effect !== activeEffect) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}
