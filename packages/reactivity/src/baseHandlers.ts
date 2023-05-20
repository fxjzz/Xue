import { hasChange } from '@xue/shared'
import { track, trigger } from './effect'

const get = createGetter()
function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver)

    track(target, key)

    return res
  }
}

const set = createSetter()
function createSetter() {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    let oldValue = target[key]
    const result = Reflect.set(target, key, value, receiver)
    if (hasChange(value, oldValue)) {
      trigger(target, key, value)
    }
    return result
  }
}

function deleteProperty() {
  return false
}
function has() {
  return false
}
function ownKeys() {
  return []
}

export const mutableHandlers: ProxyHandler<object> = {
  get,
  set,
  deleteProperty,
  has,
  ownKeys
}
