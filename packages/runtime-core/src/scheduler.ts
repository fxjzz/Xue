const queue: Function[] = []

let isFlushPending = false

const resolvedPromise = Promise.resolve() as Promise<any>
let currentFlushPromise: Promise<void> | null = null

export function queueJob(job: any) {
  queue.push(job)
  queueFlush()
}

function queueFlush() {
  if (!isFlushPending) {
    isFlushPending = true
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

function flushJobs() {
  isFlushPending = false
  if (queue.length) {
    let activeJob = [...new Set(queue)]
    queue.length = 0
    activeJob.forEach(q => q())
  }
}
