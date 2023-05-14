import { ReactiveEffect } from './effect'

export type Dep = Set<ReactiveEffect> & TrackedMarkers

type TrackedMarkers = {
  w: number //wasTracked
  n: number //newTracked
}

export const createDep = (): Dep => {
  const dep = new Set<ReactiveEffect>() as Dep

  return dep
}
