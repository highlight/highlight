import { vi } from 'vitest'

vi.mock('import.meta.env.REACT_APP_PUBLIC_GRAPH_URI', () => ({
	default: 'localhost:8082',
}))
