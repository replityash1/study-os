import type { Asset, UploadProgress, UploadTask } from '../types';

export interface UploadOne {
  (
    file: File,
    topicId: string,
    signal: AbortSignal,
    onProgress: (bytesUploaded: number) => void,
  ): Promise<Asset>;
}

export interface UploadQueueOptions {
  concurrency?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  sleep?: (milliseconds: number) => Promise<void>;
  onUpdate?: (tasks: UploadTask[], progress: UploadProgress) => void;
}

export interface UploadQueue {
  tasks: UploadTask[];
  start: () => Promise<void>;
  cancel: () => void;
  retry: (taskId: string) => Promise<void>;
}

function isTransient(error: unknown) {
  if (typeof error === 'object' && error !== null && 'transient' in error) {
    return Boolean(error.transient);
  }
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const status = Number(error.status);
    return status === 429 || status >= 500;
  }
  return true;
}

function defaultSleep(milliseconds: number) {
  return new Promise<void>((resolve) => globalThis.setTimeout(resolve, milliseconds));
}

export function createUploadQueue(
  files: Array<{ file: File; topicId: string }>,
  uploadOne: UploadOne,
  options: UploadQueueOptions = {},
): UploadQueue {
  const concurrency = Math.max(1, options.concurrency ?? 3);
  const maxRetries = Math.max(0, options.maxRetries ?? 3);
  const retryDelayMs = options.retryDelayMs ?? 400;
  const sleep = options.sleep ?? defaultSleep;
  const tasks = files.map<UploadTask>(({ file, topicId }, index) => ({
    id: `${topicId}-${file.name}-${file.lastModified}-${index}`,
    file,
    topicId,
    status: 'queued',
    progress: 0,
    error: null,
    asset: null,
  }));
  const controllers = new Map<string, AbortController>();
  let running = 0;
  let cancelled = false;
  let pumpPromise: Promise<void> | null = null;

  function progressSnapshot(): UploadProgress {
    return {
      completed: tasks.filter((task) => task.status === 'uploaded').length,
      total: tasks.length,
      bytesUploaded: tasks.reduce(
        (total, task) => total + Math.round(task.file.size * task.progress),
        0,
      ),
      bytesTotal: tasks.reduce((total, task) => total + task.file.size, 0),
    };
  }

  function notify() {
    options.onUpdate?.([...tasks], progressSnapshot());
  }

  async function process(task: UploadTask) {
    running += 1;
    task.status = 'uploading';
    task.error = null;
    notify();
    const controller = new AbortController();
    controllers.set(task.id, controller);

    try {
      for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
        if (cancelled) throw new DOMException('Upload cancelled', 'AbortError');
        try {
          task.asset = await uploadOne(task.file, task.topicId, controller.signal, (uploaded) => {
            task.progress = task.file.size ? Math.min(1, uploaded / task.file.size) : 1;
            notify();
          });
          task.progress = 1;
          task.status = 'uploaded';
          notify();
          return;
        } catch (error) {
          if (attempt >= maxRetries || !isTransient(error)) throw error;
          await sleep(retryDelayMs * 2 ** attempt);
        }
      }
    } catch (error) {
      task.status = cancelled ? 'cancelled' : 'failed';
      task.error = error instanceof Error ? error.message : 'Upload failed';
      notify();
    } finally {
      controllers.delete(task.id);
      running -= 1;
    }
  }

  async function pump() {
    while (!cancelled) {
      const next = tasks.find((task) => task.status === 'queued');
      if (!next) return;
      if (running >= concurrency) {
        await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 0));
        continue;
      }
      void process(next);
    }
  }

  async function start() {
    if (pumpPromise) return pumpPromise;
    pumpPromise = (async () => {
      notify();
      await pump();
      while (running > 0) {
        await new Promise<void>((resolve) => globalThis.setTimeout(resolve, 0));
      }
    })();
    await pumpPromise;
  }

  async function retry(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status !== 'failed') return;
    cancelled = false;
    task.status = 'queued';
    task.progress = 0;
    task.error = null;
    pumpPromise = null;
    await start();
  }

  function cancel() {
    cancelled = true;
    for (const controller of controllers.values()) controller.abort();
    for (const task of tasks) {
      if (task.status === 'queued') task.status = 'cancelled';
    }
    notify();
  }

  return {
    tasks,
    start,
    cancel,
    retry,
  };
}
