export function track(target: object, key: unknown) {
  console.log('收集依赖')
}

export function trigger(target: object, key: unknown, value: unknown) {
  console.log('触发依赖')
}
