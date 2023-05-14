function get() {
  return true
}
function set() {
  return true
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
