import assert from 'node:assert/strict'

// Simulation of UploadQueueManager logic matching client/providers/upload-provider.tsx
class UploadQueueManager {
  constructor(maxConcurrent = 3) {
    this.maxConcurrent = maxConcurrent
    this.tasks = []
    this.events = []
    this.activeUploadPromises = new Map()
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
    if (!task) return

    if (task.status === 'uploading') {
      task.abortController?.abort()
    }

    task.status = 'cancelled'
    this.processQueue()
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
    const activeCount = this.tasks.filter(t => t.status === 'uploading').length
    if (activeCount >= this.maxConcurrent) return

    const slotsAvailable = this.maxConcurrent - activeCount
    const queuedTasks = this.tasks.filter(t => t.status === 'queued')
    const tasksToStart = queuedTasks.slice(0, slotsAvailable)

    tasksToStart.forEach(task => {
      task.status = 'uploading'
    })
  }

  // Simulate server finishing upload
  simulateUploadComplete(id, fileData) {
    const task = this.tasks.find(t => t.id === id)
    if (!task) return

    // Late response immunity
    if (task.status === 'cancelled') {
      // Do not mark completed or notify
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

  // Test 5: Late server response protection
  test('Late server 201 response does not flip a cancelled task to completed or emit events', () => {
    const queue = new UploadQueueManager(2)
    const task = queue.addTask('late.txt', 100)

    // User cancels upload
    queue.cancelTask(task.id)
    assert.equal(task.status, 'cancelled')

    // Server late response arrives
    queue.simulateUploadComplete(task.id, { id: task.id, name: 'late.txt' })

    assert.equal(task.status, 'cancelled', 'Task must remain cancelled')
    assert.equal(queue.events.length, 0, 'No upload event should be emitted for cancelled task')
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

  console.log(`\n=== Client Queue Test Results: ${passed} passed, ${failed} failed ===\n`)
  if (failed > 0) process.exit(1)
}

runClientQueueTests().catch(err => {
  console.error('Fatal error in client tests:', err)
  process.exit(1)
})
