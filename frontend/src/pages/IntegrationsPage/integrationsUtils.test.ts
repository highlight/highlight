import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
	filterAndSortIntegrations,
	getCategoryCounts,
	getConnectedCount,
	getIntegrationCategory,
	getIntegrationStatus,
	INTEGRATION_CATEGORIES,
	type IntegrationSummary,
} from './integrationsUtils.ts'

const SAMPLE_INTEGRATIONS: IntegrationSummary[] = [
	{
		key: 'slack',
		name: 'Slack',
		description: 'Bring your highlight.io comments and alerts to Slack.',
		defaultEnable: false,
	},
	{
		key: 'linear',
		name: 'Linear',
		description: 'Bring your highlight.io comments to Linear as issues.',
		defaultEnable: true,
	},
	{
		key: 'vercel',
		name: 'Vercel',
		description: 'Configuration for your Vercel projects.',
		defaultEnable: false,
	},
	{
		key: 'github',
		name: 'GitHub',
		description:
			'Create GitHub issues from comments and enhance your stacktraces.',
		defaultEnable: true,
	},
	{
		key: 'discord',
		name: 'Discord',
		description: 'Bring your highlight.io alerts to Discord as messages.',
		defaultEnable: false,
	},
	{
		key: 'clearbit',
		name: 'Clearbit',
		description: 'Collect enhanced user analytics.',
		defaultEnable: false,
	},
	{
		key: 'cloudflare',
		name: 'Cloudflare',
		description: 'Setup a Cloudflare Proxy.',
		defaultEnable: true,
	},
]

describe('integrationsUtils', () => {
	it('1. defines all expected category tabs in order', () => {
		assert.deepEqual(
			INTEGRATION_CATEGORIES.map((c) => c.id),
			[
				'all',
				'issue_tracking',
				'messaging',
				'infrastructure',
				'analytics_automation',
			],
		)
	})

	it('2. resolves integration categories by key and respects explicit override', () => {
		assert.equal(getIntegrationCategory('linear'), 'issue_tracking')
		assert.equal(getIntegrationCategory('slack'), 'messaging')
		assert.equal(getIntegrationCategory('vercel'), 'infrastructure')
		assert.equal(
			getIntegrationCategory('clearbit'),
			'analytics_automation',
		)
		assert.equal(
			getIntegrationCategory('slack', 'infrastructure'),
			'infrastructure',
		)
	})

	it('3. falls back safely to analytics_automation for unknown integration keys', () => {
		assert.equal(
			getIntegrationCategory('custom_unknown_tool'),
			'analytics_automation',
		)
	})

	it('4. returns Connected or Available status labels accurately', () => {
		assert.equal(getIntegrationStatus(true), 'Connected')
		assert.equal(getIntegrationStatus(false), 'Available')
		assert.equal(getIntegrationStatus(undefined), 'Available')
	})

	it('5. returns all integrations when category is all', () => {
		const result = filterAndSortIntegrations(SAMPLE_INTEGRATIONS, {
			category: 'all',
			connectedFirst: false,
		})
		assert.equal(result.length, SAMPLE_INTEGRATIONS.length)
	})

	it('6. filters integrations by specific category', () => {
		const issueTrackers = filterAndSortIntegrations(SAMPLE_INTEGRATIONS, {
			category: 'issue_tracking',
		})
		assert.deepEqual(
			issueTrackers.map((i) => i.key),
			['linear', 'github'],
		)

		const infra = filterAndSortIntegrations(SAMPLE_INTEGRATIONS, {
			category: 'infrastructure',
		})
		assert.deepEqual(
			infra.map((i) => i.key),
			['cloudflare', 'vercel'],
		)
	})

	it('7. filters integrations by instant search query on name (case-insensitive)', () => {
		const result = filterAndSortIntegrations(SAMPLE_INTEGRATIONS, {
			searchQuery: '  sLaCk ',
		})
		assert.deepEqual(
			result.map((i) => i.key),
			['slack'],
		)
	})

	it('8. filters integrations by description and category label in search query', () => {
		const byDescription = filterAndSortIntegrations(SAMPLE_INTEGRATIONS, {
			searchQuery: 'stacktraces',
		})
		assert.deepEqual(
			byDescription.map((i) => i.key),
			['github'],
		)

		const byCategoryLabel = filterAndSortIntegrations(SAMPLE_INTEGRATIONS, {
			searchQuery: 'messaging',
		})
		assert.deepEqual(
			byCategoryLabel.map((i) => i.key),
			['slack', 'discord'],
		)
	})

	it('9. combines category tab filter and search query simultaneously', () => {
		const result = filterAndSortIntegrations(SAMPLE_INTEGRATIONS, {
			category: 'messaging',
			searchQuery: 'alerts',
		})
		assert.deepEqual(
			result.map((i) => i.key),
			['slack', 'discord'],
		)

		const empty = filterAndSortIntegrations(SAMPLE_INTEGRATIONS, {
			category: 'infrastructure',
			searchQuery: 'slack',
		})
		assert.deepEqual(empty, [])
	})

	it('10. prioritizes connected integrations first while preserving relative order', () => {
		const result = filterAndSortIntegrations(SAMPLE_INTEGRATIONS, {
			category: 'all',
			connectedFirst: true,
		})
		assert.deepEqual(
			result.map((i) => i.key),
			[
				'linear',
				'github',
				'cloudflare',
				'slack',
				'vercel',
				'discord',
				'clearbit',
			],
		)
	})

	it('11. preserves original order when connectedFirst is false', () => {
		const result = filterAndSortIntegrations(SAMPLE_INTEGRATIONS, {
			category: 'all',
			connectedFirst: false,
		})
		assert.deepEqual(
			result.map((i) => i.key),
			SAMPLE_INTEGRATIONS.map((i) => i.key),
		)
	})

	it('12. computes category counts accurately without search query', () => {
		const counts = getCategoryCounts(SAMPLE_INTEGRATIONS)
		assert.deepEqual(counts, {
			all: 7,
			issue_tracking: 2,
			messaging: 2,
			infrastructure: 2,
			analytics_automation: 1,
		})
	})

	it('13. updates category counts dynamically when search query is active', () => {
		const counts = getCategoryCounts(SAMPLE_INTEGRATIONS, 'issues')
		assert.deepEqual(counts, {
			all: 2,
			issue_tracking: 2,
			messaging: 0,
			infrastructure: 0,
			analytics_automation: 0,
		})
	})

	it('14. counts connected integrations accurately', () => {
		assert.equal(getConnectedCount(SAMPLE_INTEGRATIONS), 3)
		assert.equal(getConnectedCount([]), 0)
	})
})
