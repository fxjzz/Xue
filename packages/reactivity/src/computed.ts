import { isFunction } from '@xue/shared'
import { Dep } from './dep'
import { ReactiveEffect } from './effect'
import { trackRefValue } from './ref'

export class ComputedRefImpl<T> {
  public dep?: Dep = undefined

  private _value!: T
  public readonly effect: ReactiveEffect<T>
  public readonly __v_isRef = true

  public _dirty = true
  constructor(getter: any, private readonly _setter, isReadonly: boolean) {
    this.effect = new ReactiveEffect(getter)
    this.effect.computed = this
  }

  get value() {
    trackRefValue(this)
    this._value = this.effect.run() //getter函数run
    return this._value
  }

  set value(newVal) {}
}

export function computed(getterOrOptions) {
  let getter
  let setter

  const onlyGetter = isFunction(getterOrOptions)
  if (onlyGetter) {
    getter = getterOrOptions
    setter = () => {}
  } else {
    getter = getterOrOptions.get
    setter = getterOrOptions.set
  }

  const cRef = new ComputedRefImpl(getter, setter, onlyGetter || !setter)

  return cRef
}
