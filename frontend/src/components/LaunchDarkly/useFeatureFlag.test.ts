import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react-hooks'
import { useFeatureFlag } from './useFeatureFlag'
import * as launchDarkly from 'launchdarkly-react-client-sdk'
import { flags } from './flags'

vi.mock('launchdarkly-react-client-sdk', () => ({
	useFlags: vi.fn(),
}))

describe('useFeatureFlag', () => {
	it('returns flag value from LaunchDarkly when available', () => {
		vi.mocked(launchDarkly.useFlags).mockReturnValue({
			myFlag: true,
		})

		const { result } = renderHook(() => useFeatureFlag('myFlag'))
		expect(result.current).toBe(true)
	})

	it('returns default value when LaunchDarkly returns empty object', () => {
		vi.mocked(launchDarkly.useFlags).mockReturnValue({})

		const { result } = renderHook(() =>
			useFeatureFlag('enable-session-card-text'),
		)
		expect(result.current).toBe(
			flags['enable-session-card-text'].defaultValue,
		)
	})

	it('returns default value when flag is not in LaunchDarkly response', () => {
		vi.mocked(launchDarkly.useFlags).mockReturnValue({})

		const { result } = renderHook(() =>
			useFeatureFlag('enable-session-card-text'),
		)
		expect(result.current).toBe(
			flags['enable-session-card-text'].defaultValue,
		)
	})

	it('returns undefined when there is no flag config', () => {
		const { result } = renderHook(() => useFeatureFlag('non-existent-flag'))
		expect(result.current).toBeUndefined()
	})
})
