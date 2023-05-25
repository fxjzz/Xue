const queue: Array<any> = []

export function queueJob(job: any) {
  queue.push(job)
  queueFlush()
}

function queueFlush() {
  Promise.resolve().then(flushJobs)
}

function flushJobs() {
  queue.forEach(q => q())
}
