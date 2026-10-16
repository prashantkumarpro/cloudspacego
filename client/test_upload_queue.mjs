import assert from 'node:assert/strict'

// Simulation of UploadQueueManager logic matching client/providers/upload-provider.tsx
class UploadQueueManager {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent
    this.tasks = []
    this.events = []
    this.reconciledFiles = []
    this.isCancellingAll = false
  }

  addTask(name, size, file = { name, size }, parentDirId = null) {
    const taskId = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const controller = new AbortController()
    const task = {
      id: taskId,
      name,
      size,
      progress: 0,
      status: 'queued',
      parentDirId,
      createdAt: Date.now(),
      file,
      abortController: controller
    }
    this.tasks.push(task)
    this.processQueue()
    return task
  }

  addBatch(items, parentDirId = null) {
    return items.map(item => this.addTask(item.name, item.size, item, parentDirId))
  }

  cancelTask(id) {
    const task = this.tasks.find(t => t.id === id)
    if (!task || task.status === 'completed' || task.status === 'cancelled') return

    if (task.status === 'uploading') {
      try {
        task.abortController?.abort()
      } catch (err) {
        console.warn('Abort error ignored:', err)
      }
    }

    task.status = 'cancelled'
    this.processQueue()
  }

  cancelAll() {
    if (this.isCancellingAll) return

    const cancellableTasks = this.tasks.filter(
      t => t.status === 'uploading' || t.status === 'queued'
    )
    if (cancellableTasks.length === 0) return

    this.isCancellingAll = true

    try {
      // 1. Abort active upload controllers
      cancellableTasks.forEach(task => {
        if (task.status === 'uploading') {
          try {
            task.abortController?.abort()
          } catch (abortErr) {
            // Handled gracefully without interrupting batch cancellation
          }
        }
        // 2. Mark task cancelled promptly
        task.status = 'cancelled'
      })
    } finally {
      this.isCancellingAll = false
      this.processQueue()
    }
  }

  retryTask(id) {
    const task = this.tasks.find(t => t.id === id)
    if (!task || !task.file) return

    task.abortController = new AbortController()
    task.status = 'queued'
    task.progress = 0
    task.error = undefined
    this.processQueue()
  }

  processQueue() {
    if (this.isCancellingAll) return

    const activeCount = this.tasks.filter(t => t.status === 'uploading').length
    if (activeCount >= this.maxConcurrent) return

    const slotsAvailable = this.maxConcurrent - activeCount
    const queuedTasks = this.tasks.filter(t => t.status === 'queued')
    const tasksToStart = queuedTasks.slice(0, slotsAvailable)

    tasksToStart.forEach(task => {
      task.status = 'uploading'
    })
  }

  // Simulate server finishing upload (or late response)
  simulateUploadComplete(id, fileData) {
    const task = this.tasks.find(t => t.id === id)
    if (!task) return

    // Late response protection: task was cancelled before server response
    if (task.status === 'cancelled') {
      // Server reconciliation: file completed on server despite client cancellation
      // Reconcile by deleting the orphaned file from server
      const fileId = fileData?.id || task.id
      this.reconciledFiles.push(fileId)
      return
    }

    task.status = 'completed'
    task.progress = 100
    this.events.push({
      type: 'upload',
      file: fileData || { id: task.id, name: task.name, size: task.size }
    })
    this.processQueue()
  }

  // Simulate server / network failure
  simulateUploadError(id, errorMessage) {
    const task = this.tasks.find(t => t.id === id)
    if (!task) return

    if (task.status === 'cancelled') {
      return
    }

    task.status = 'error'
    task.error = errorMessage
    this.processQueue()
  }
}

async function runClientQueueTests() {
  console.log('=== Starting CloudSpaceGo Client Upload Queue Test Suite ===\n')

  let passed = 0
  let failed = 0

  function test(name, fn) {
    try {
      fn()
      console.log(`  ✓ ${name}`)
      passed++
    } catch (err) {
      console.error(`  ✗ FAIL: ${name}`, err.message)
      failed++
    }
  }

  // Test 1: Concurrency Control (Max 3 concurrent)
  test('Concurrency limit enforces max 3 active uploads while others remain queued', () => {
    const queue = new UploadQueueManager(3)
    const tasks = queue.addBatch([
      { name: 'file1.txt', size: 100 },
      { name: 'file2.txt', size: 200 },
      { name: 'file3.txt', size: 300 },
      { name: 'file4.txt', size: 400 },
      { name: 'file5.txt', size: 500 }
    ])

    const uploadingCount = queue.tasks.filter(t => t.status === 'uploading').length
    const queuedCount = queue.tasks.filter(t => t.status === 'queued').length

    assert.equal(uploadingCount, 3, 'Exactly 3 tasks should be uploading')
    assert.equal(queuedCount, 2, 'Exactly 2 tasks should be queued')
    assert.equal(tasks[0].status, 'uploading')
    assert.equal(tasks[1].status, 'uploading')
    assert.equal(tasks[2].status, 'uploading')
    assert.equal(tasks[3].status, 'queued')
    assert.equal(tasks[4].status, 'queued')
  })

  // Test 2: Next queued item automatically picks up on completion
  test('Next queued task automatically transitions to uploading when an active task completes', () => {
    const queue = new UploadQueueManager(3)
    const tasks = queue.addBatch([
      { name: 'f1.txt', size: 10 },
      { name: 'f2.txt', size: 20 },
      { name: 'f3.txt', size: 30 },
      { name: 'f4.txt', size: 40 }
    ])

    assert.equal(tasks[3].status, 'queued')

    // Simulate completion of task 1
    queue.simulateUploadComplete(tasks[0].id)

    assert.equal(tasks[0].status, 'completed')
    assert.equal(tasks[0].progress, 100)
    assert.equal(tasks[3].status, 'uploading', 'Task 4 should have automatically transitioned to uploading')
    assert.equal(queue.events.length, 1)
    assert.equal(queue.events[0].type, 'upload')
  })

  // Test 3: Independent cancellation of queued tasks
  test('Cancelling a queued task sets status to cancelled and prevents it from running', () => {
    const queue = new UploadQueueManager(2)
    const tasks = queue.addBatch([
      { name: 'f1.txt', size: 10 },
      { name: 'f2.txt', size: 20 },
      { name: 'f3.txt', size: 30 }
    ])

    assert.equal(tasks[2].status, 'queued')

    // Cancel queued task 3 before it ever starts
    queue.cancelTask(tasks[2].id)
    assert.equal(tasks[2].status, 'cancelled')

    // Finish task 1
    queue.simulateUploadComplete(tasks[0].id)

    // Task 3 must NOT start because it was cancelled
    assert.equal(tasks[2].status, 'cancelled')
    const active = queue.tasks.filter(t => t.status === 'uploading')
    assert.equal(active.length, 1, 'Only remaining active task should be uploading')
  })

  // Test 4: Independent cancellation of active upload
  test('Cancelling an active upload triggers AbortController.abort() and releases slot for queued tasks', () => {
    const queue = new UploadQueueManager(2)
    const tasks = queue.addBatch([
      { name: 'active1.txt', size: 10 },
      { name: 'active2.txt', size: 20 },
      { name: 'queued3.txt', size: 30 }
    ])

    assert.equal(tasks[0].status, 'uploading')
    assert.equal(tasks[1].status, 'uploading')
    assert.equal(tasks[2].status, 'queued')

    let aborted = false
    tasks[0].abortController.signal.addEventListener('abort', () => {
      aborted = true
    })

    // Cancel active task 0
    queue.cancelTask(tasks[0].id)

    assert.equal(aborted, true, 'AbortSignal should have fired')
    assert.equal(tasks[0].status, 'cancelled')
    assert.equal(tasks[2].status, 'uploading', 'Queued task 3 should immediately take the freed slot')
  })

  // Test 5: Late server response protection & server reconciliation
  test('Late server 201 response does not flip a cancelled task to completed, emits no events, and reconciles server state', () => {
    const queue = new UploadQueueManager(2)
    const task = queue.addTask('late.txt', 100)

    // User cancels upload
    queue.cancelTask(task.id)
    assert.equal(task.status, 'cancelled')

    // Server late response arrives
    queue.simulateUploadComplete(task.id, { id: 'srv-file-123', name: 'late.txt' })

    assert.equal(task.status, 'cancelled', 'Task must remain cancelled')
    assert.equal(queue.events.length, 0, 'No upload event should be emitted for cancelled task')
    assert.equal(queue.reconciledFiles.length, 1, 'Late server completion should trigger reconciliation')
    assert.equal(queue.reconciledFiles[0], 'srv-file-123', 'Reconciliation targeted the completed server file id')
  })

  // Test 6: Retry after failure or cancellation
  test('Retrying a failed or cancelled task re-queues it with a fresh AbortController and executes successfully', () => {
    const queue = new UploadQueueManager(2)
    const task = queue.addTask('retry_me.txt', 500)

    // Fail first
    queue.simulateUploadError(task.id, 'Network connection timed out')
    assert.equal(task.status, 'error')
    assert.equal(task.error, 'Network connection timed out')

    const oldController = task.abortController

    // Retry task
    queue.retryTask(task.id)

    assert.notEqual(task.abortController, oldController, 'New AbortController should be created')
    assert.equal(task.abortController.signal.aborted, false)
    assert.equal(task.status, 'uploading')
    assert.equal(task.error, undefined)
    assert.equal(task.progress, 0)

    // Now completes
    queue.simulateUploadComplete(task.id)
    assert.equal(task.status, 'completed')
    assert.equal(task.progress, 100)
    assert.equal(queue.events.length, 1)
  })

  // Test 7: Cancel All with multiple queued and active uploads together
  test('Cancel All aborts every active upload and cancels every queued upload without starting it', () => {
    const queue = new UploadQueueManager(3)
    const tasks = queue.addBatch([
      { name: 'active1.txt', size: 100 },
      { name: 'active2.txt', size: 200 },
      { name: 'active3.txt', size: 300 },
      { name: 'queued4.txt', size: 400 },
      { name: 'queued5.txt', size: 500 }
    ])

    const abortFlags = [false, false, false]
    tasks[0].abortController.signal.addEventListener('abort', () => { abortFlags[0] = true })
    tasks[1].abortController.signal.addEventListener('abort', () => { abortFlags[1] = true })
    tasks[2].abortController.signal.addEventListener('abort', () => { abortFlags[2] = true })

    queue.cancelAll()

    assert.equal(abortFlags[0], true, 'Active task 1 AbortController should have fired')
    assert.equal(abortFlags[1], true, 'Active task 2 AbortController should have fired')
    assert.equal(abortFlags[2], true, 'Active task 3 AbortController should have fired')

    assert.equal(tasks[0].status, 'cancelled')
    assert.equal(tasks[1].status, 'cancelled')
    assert.equal(tasks[2].status, 'cancelled')
    assert.equal(tasks[3].status, 'cancelled')
    assert.equal(tasks[4].status, 'cancelled')

    const activeCount = queue.tasks.filter(t => t.status === 'uploading').length
    const queuedCount = queue.tasks.filter(t => t.status === 'queued').length
    assert.equal(activeCount, 0, 'Zero tasks should be uploading')
    assert.equal(queuedCount, 0, 'Zero tasks should be queued')
  })

  // Test 8: Completed uploads remain untouched during Cancel All
  test('Cancel All leaves already completed uploads completely untouched', () => {
    const queue = new UploadQueueManager(3)
    const tasks = queue.addBatch([
      { name: 'already_done.txt', size: 100 },
      { name: 'active1.txt', size: 200 },
      { name: 'queued2.txt', size: 300 }
    ])

    // Complete task 0 before cancelAll is called
    queue.simulateUploadComplete(tasks[0].id)
    assert.equal(tasks[0].status, 'completed')
    assert.equal(tasks[0].progress, 100)

    // Now call cancelAll
    queue.cancelAll()

    // Completed task remains untouched
    assert.equal(tasks[0].status, 'completed', 'Completed task status must not change')
    assert.equal(tasks[0].progress, 100, 'Completed task progress must remain 100')
    assert.equal(queue.events.length, 1, 'Completed upload event preserved')

    // In-flight and queued were cancelled
    assert.equal(tasks[1].status, 'cancelled')
    assert.equal(tasks[2].status, 'cancelled')
  })

  // Test 9: No queued upload starts during or after batch cancellation
  test('No queued upload starts during or after batch cancellation', () => {
    const queue = new UploadQueueManager(2)
    const tasks = queue.addBatch([
      { name: 'a1.txt', size: 100 },
      { name: 'a2.txt', size: 200 },
      { name: 'q1.txt', size: 300 },
      { name: 'q2.txt', size: 400 },
      { name: 'q3.txt', size: 500 }
    ])

    assert.equal(tasks[2].status, 'queued')
    assert.equal(tasks[3].status, 'queued')
    assert.equal(tasks[4].status, 'queued')

    queue.cancelAll()

    // None of the queued tasks should have ever transitioned to uploading
    assert.equal(tasks[2].status, 'cancelled')
    assert.equal(tasks[3].status, 'cancelled')
    assert.equal(tasks[4].status, 'cancelled')

    // Calling processQueue again must still not start any of them
    queue.processQueue()
    const uploading = queue.tasks.filter(t => t.status === 'uploading')
    assert.equal(uploading.length, 0, 'No tasks should be started')
  })

  // Test 10: Repeated Cancel All clicks are safe and idempotent
  test('Repeated Cancel All clicks handle race conditions safely and do not throw or duplicate state', () => {
    const queue = new UploadQueueManager(3)
    const tasks = queue.addBatch([
      { name: 'f1.txt', size: 100 },
      { name: 'f2.txt', size: 200 }
    ])

    let abortCount = 0
    tasks[0].abortController.signal.addEventListener('abort', () => { abortCount++ })

    // Repeated clicks in rapid succession
    queue.cancelAll()
    queue.cancelAll()
    queue.cancelAll()

    assert.equal(abortCount, 1, 'Abort listener should only trigger once')
    assert.equal(tasks[0].status, 'cancelled')
    assert.equal(tasks[1].status, 'cancelled')
  })

  // Test 11: Cancellation while an upload is close to completing
  test('Cancellation while an upload is close to completing preserves cancelled state and rejects late response', () => {
    const queue = new UploadQueueManager(2)
    const task = queue.addTask('near_done.txt', 1000)

    // Simulate progress near completion
    task.progress = 99
    assert.equal(task.progress, 99)

    // User cancels right before final bytes finish
    queue.cancelTask(task.id)
    assert.equal(task.status, 'cancelled')

    // Server late response arrives
    queue.simulateUploadComplete(task.id, { id: 'near-done-file', name: 'near_done.txt' })

    assert.equal(task.status, 'cancelled', 'Task must remain cancelled despite being at 99%')
    assert.equal(queue.events.length, 0, 'No completed event emitted')
    assert.equal(queue.reconciledFiles.includes('near-done-file'), true, 'Reconciliation requested for server file')
  })

  // Test 12: Failed abort request handled gracefully
  test('Failed or throwing abort controller does not crash Cancel All and tasks still cancel', () => {
    const queue = new UploadQueueManager(2)
    const tasks = queue.addBatch([
      { name: 'faulty_abort.txt', size: 100 },
      { name: 'normal_abort.txt', size: 200 }
    ])

    // Simulate a faulty abort controller that throws an unexpected error
    tasks[0].abortController = {
      abort() {
        throw new Error('Socket already closed unexpectedly')
      },
      signal: { aborted: false }
    }

    // cancelAll should catch and continue without throwing
    queue.cancelAll()

    assert.equal(tasks[0].status, 'cancelled')
    assert.equal(tasks[1].status, 'cancelled')
  })

  // Test 13: Queue slots released correctly after Cancel All
  test('Queue slots are released correctly after Cancel All, allowing new tasks and retried tasks to run', () => {
    const queue = new UploadQueueManager(3)
    const tasks = queue.addBatch([
      { name: 'f1.txt', size: 100 },
      { name: 'f2.txt', size: 200 },
      { name: 'f3.txt', size: 300 }
    ])

    assert.equal(queue.tasks.filter(t => t.status === 'uploading').length, 3)

    // Cancel all active uploads
    queue.cancelAll()
    assert.equal(queue.tasks.filter(t => t.status === 'uploading').length, 0)

    // Retrying f1 should immediately gain an active slot
    queue.retryTask(tasks[0].id)
    assert.equal(tasks[0].status, 'uploading', 'Retried task 0 should immediately start uploading')

    // Adding 2 new tasks should also start up to limit of 3
    const newTasks = queue.addBatch([
      { name: 'new1.txt', size: 400 },
      { name: 'new2.txt', size: 500 }
    ])

    assert.equal(newTasks[0].status, 'uploading', 'New task 1 should start')
    assert.equal(newTasks[1].status, 'uploading', 'New task 2 should start')

    const uploadingCount = queue.tasks.filter(t => t.status === 'uploading').length
    assert.equal(uploadingCount, 3, 'Queue maintains exact concurrency limit of 3')

    // Adding 4th task stays queued
    const extra = queue.addTask('extra.txt', 600)
    assert.equal(extra.status, 'queued', 'Extra task stays queued until slot opens')
  })

  console.log(`\n=== Client Queue Test Results: ${passed} passed, ${failed} failed ===\n`)
  if (failed > 0) process.exit(1)
}

runClientQueueTests().catch(err => {
  console.error('Fatal error in client tests:', err)
  process.exit(1)
})
