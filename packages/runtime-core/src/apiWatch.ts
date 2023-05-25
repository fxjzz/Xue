import { ReactiveEffect, isReactive, isRef } from '@xue/reactivity'
import { queueJob } from './scheduler'
import { EMPTY_OBJ, hasChange, isObject } from '@xue/shared'

export interface WatchOptions {
  immediate?: boolean
  deep?: boolean
}

export function watch(source, cb: Function, options?: WatchOptions) {
  return doWatch(source as any, cb, options)
}

//先假设source Proxy
function doWatch(
  source,
  cb: Function,
  { immediate, deep }: WatchOptions = EMPTY_OBJ
) {
  const instance = null

  let getter: () => any

  if (isReactive(source)) {
    getter = () => source
    deep = true
  } else {
    getter = () => {}
  }

  if (cb && deep) {
    //
    const baseGetter = getter
    getter = () => traverse(baseGetter())
  }

  let cleanup: () => void

  let oldValue

  const job = () => {
    if (cb) {
      const newValue = effect.run()
      if (deep || hasChange(newValue, oldValue)) {
        cb(newValue, oldValue)
        oldValue = newValue
      }
    }
  }

  let scheduler
  scheduler = () => queueJob(job)

  const effect = new ReactiveEffect(getter, scheduler)

  if (cb) {
    if (immediate) {
      job()
    } else {
      oldValue = effect.run()
    }
  }
}

export function traverse(value: unknown) {
  if (!isObject(value)) {
    return value
  }
  console.log(value)

  const arr = Object.getOwnPropertyNames(value as object)
  console.log(arr)

  arr.forEach(a => {
    traverse((value as object)[a])
  })

  return value
}
