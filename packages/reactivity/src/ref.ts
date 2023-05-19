import { Dep, createDep } from './dep'
import { activeEffect, trackEffects } from './effect'
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

  public dep?: Dep = undefined

  constructor(value: T, isShallow: boolean) {
    this._value = isShallow ? value : toReactive(value)
  }

  get value() {
    trackRefValue(this)
    return this._value
  }
  set value(newVal) {}
}

export function trackRefValue(ref: any) {
  if (activeEffect) {
    trackEffects(ref.dep || (ref.dep = createDep()))
  }
}

export function isRef(r: any): r is Ref {
  return !!(r && r.__v_isRef === true)
}
