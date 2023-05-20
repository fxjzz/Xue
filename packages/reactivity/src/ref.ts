import { hasChange } from '@xue/shared'
import { Dep, createDep } from './dep'
import { activeEffect, trackEffects, triggerEffects } from './effect'
import { reactive, toReactive } from './reactive'

export interface Ref<T = any> {
  value: T
}

export function ref(value: unknown) {
  return createRef(value, false)
}

function createRef(rawValue: unknown, isShallow: boolean) {
  if (isRef(rawValue)) {
    return rawValue
  }
  return new RefImpl(rawValue, isShallow)
}

class RefImpl<T> {
  private _value: T
  private _rawValue: T

  public dep?: Dep = undefined

  constructor(value: T, isShallow: boolean) {
    this._rawValue = value
    this._value = isShallow ? value : toReactive(value)
  }

  //给reactive准备的
  get value() {
    trackRefValue(this)
    return this._value
  }

  //给基本数据类型准备的
  set value(newVal) {
    if (hasChange(newVal, this._rawValue)) {
      this._rawValue = newVal
      this._value = toReactive(newVal)
      triggerRefValue(this)
    }
  }
}

export function trackRefValue(ref: any) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

export function triggerRefValue(ref) {
  if (ref.dep) {
    triggerEffects(ref.dep)
  }
}

export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true)
}
