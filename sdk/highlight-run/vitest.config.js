import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.test.{ts,tsx}'],
		setupFiles: ['./src/__tests__/setup.ts', '@vitest/web-worker'],
	},
})
