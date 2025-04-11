import { beforeAll, vi } from 'vitest'
import 'vitest-canvas-mock'

vi.mock('import.meta.env.REACT_APP_PUBLIC_GRAPH_URI', () => ({
	default: 'localhost:8082',
}))

class WorkerStub implements Worker {
	postMessage(_message: unknown, _options?: unknown): void {
		throw new Error('Method not implemented.')
	}
	terminate(): void {
		throw new Error('Method not implemented.')
	}
	addEventListener(
		_type: unknown,
		_listener: unknown,
		_options?: unknown,
	): void {
		throw new Error('Method not implemented.')
	}
	removeEventListener(
		_type: unknown,
		_listener: unknown,
		_options?: unknown,
	): void {
		throw new Error('Method not implemented.')
	}
	dispatchEvent(_event: Event): boolean {
		throw new Error('Method not implemented.')
	}

	onerror!: ((this: AbstractWorker, ev: ErrorEvent) => any) | null
	onmessage!: ((this: Worker, ev: MessageEvent) => any) | null
	onmessageerror!: ((this: Worker, ev: MessageEvent) => any) | null
}

beforeAll(() => {
	globalThis.Worker = WorkerStub as unknown as typeof Worker
})
