import { ShapeFlags } from './shapeFlags'
import { normalizeClass } from './normalizeProp'

export const isObject = (val: unknown) =>
  val !== null && typeof val === 'object'

export const hasChange = (value: any, oldValue: any): boolean =>
  !Object.is(value, oldValue)

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'

export const extend = Object.assign

export const EMPTY_OBJ: { readonly [key: string]: any } = {}

export const isArray = Array.isArray

export const isString = (val: unknown): val is string => typeof val === 'string'

export { ShapeFlags, normalizeClass }
