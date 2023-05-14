const get = createGetter()
function createGetter() {
  return function get(target: object, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver)

    track()

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
    const result = Reflect.set(target, key, value, receiver)

    trigger()

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
