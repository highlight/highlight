import { vi } from 'vitest'
import 'vitest-canvas-mock'
import { beforeAll } from 'vitest'

vi.mock('import.meta.env.REACT_APP_PUBLIC_GRAPH_URI', () => ({
	default: 'localhost:8082',
}))

// Create a simple Worker stub that mimics minimal worker functionality.
class WorkerStub {
	onmessage: ((this: Worker, ev: MessageEvent<any>) => any) | null = null

	constructor(stringUrl: string) {
		// You can implement custom behavior if needed.
	}

	postMessage(message: any) {
		// Directly call onmessage if defined. You may customize this behavior.
		if (this.onmessage) {
			this.onmessage({ data: message } as MessageEvent)
		}
	}

	terminate() {
		// Stub - nothing to clean up.
	}
}

beforeAll(() => {
	// Assign the stub to the global context so that Worker is available in vitest.
	globalThis.Worker = WorkerStub as unknown as typeof Worker
})
