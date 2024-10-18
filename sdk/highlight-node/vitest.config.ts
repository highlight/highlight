/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
	test: {
		environment: 'node',
		globals: true,
		include: ['src/**/*.test.{ts,tsx}'],
	},
})
