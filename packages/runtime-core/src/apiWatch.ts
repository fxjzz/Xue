import { ReactiveEffect, isRef } from '@xue/reactivity'
import { queueJob } from './scheduler'

export function watch(source, cb, options?) {
  return doWatch(source as any, cb, options)
}

//先假设source Proxy
function doWatch(source, cb, { immediate, deep }) {
  const instance = null

  let getter: () => any
  getter = () => source
  deep = true

  if (cb && deep) {
    getter
  }

  let cleanup: () => void

  let oldValue

  const job = () => {}

  let scheduler
  scheduler = () => queueJob(job)

  const effect = new ReactiveEffect(getter, scheduler)

  oldValue = effect.run()
}
