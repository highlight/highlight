export type IntegrationCategory =
	| 'all'
	| 'issue_tracking'
	| 'messaging'
	| 'infrastructure'
	| 'analytics_automation'

export type IntegrationSpecificCategory = Exclude<IntegrationCategory, 'all'>

export type IntegrationStatus = 'Connected' | 'Available'

export interface IntegrationSummary {
	key: string
	name: string
	description: string
	defaultEnable?: boolean
	category?: IntegrationSpecificCategory
}

export interface CategoryDefinition {
	id: IntegrationCategory
	label: string
}

export const INTEGRATION_CATEGORIES: CategoryDefinition[] = [
	{ id: 'all', label: 'All' },
	{ id: 'issue_tracking', label: 'Issue Tracking' },
	{ id: 'messaging', label: 'Messaging & Alerts' },
	{ id: 'infrastructure', label: 'Infrastructure' },
	{ id: 'analytics_automation', label: 'Analytics & Automation' },
]

const CATEGORY_MAP: Record<string, IntegrationSpecificCategory> = {
	linear: 'issue_tracking',
	jira: 'issue_tracking',
	gitlab: 'issue_tracking',
	clickup: 'issue_tracking',
	height: 'issue_tracking',
	github: 'issue_tracking',
	slack: 'messaging',
	microsoft_teams: 'messaging',
	discord: 'messaging',
	vercel: 'infrastructure',
	heroku: 'infrastructure',
	cloudflare: 'infrastructure',
	zapier: 'analytics_automation',
	clearbit: 'analytics_automation',
}

export const CATEGORY_LABELS: Record<IntegrationCategory, string> = {
	all: 'All',
	issue_tracking: 'Issue Tracking',
	messaging: 'Messaging & Alerts',
	infrastructure: 'Infrastructure',
	analytics_automation: 'Analytics & Automation',
}

export function getIntegrationCategory(
	key: string,
	explicitCategory?: IntegrationSpecificCategory,
): IntegrationSpecificCategory {
	if (explicitCategory) {
		return explicitCategory
	}
	return CATEGORY_MAP[key] ?? 'analytics_automation'
}

export function getIntegrationStatus(enabled?: boolean): IntegrationStatus {
	return enabled ? 'Connected' : 'Available'
}

function matchesSearchQuery(
	item: IntegrationSummary,
	normalizedQuery: string,
): boolean {
	if (!normalizedQuery) {
		return true
	}

	const category = getIntegrationCategory(item.key, item.category)
	const categoryLabel = CATEGORY_LABELS[category].toLowerCase()

	return (
		item.name.toLowerCase().includes(normalizedQuery) ||
		item.description.toLowerCase().includes(normalizedQuery) ||
		item.key.toLowerCase().includes(normalizedQuery) ||
		categoryLabel.includes(normalizedQuery)
	)
}

export interface FilterIntegrationsOptions {
	category?: IntegrationCategory
	searchQuery?: string
	connectedFirst?: boolean
}

export function filterAndSortIntegrations<T extends IntegrationSummary>(
	items: readonly T[],
	options: FilterIntegrationsOptions = {},
): T[] {
	const {
		category = 'all',
		searchQuery = '',
		connectedFirst = true,
	} = options
	const normalizedQuery = searchQuery.trim().toLowerCase()

	const filtered = items.filter((item) => {
		const itemCategory = getIntegrationCategory(item.key, item.category)
		const categoryMatch = category === 'all' || itemCategory === category
		return categoryMatch && matchesSearchQuery(item, normalizedQuery)
	})

	if (!connectedFirst) {
		return [...filtered]
	}

	return filtered
		.map((item, index) => ({ item, index }))
		.sort((a, b) => {
			const aConnected = a.item.defaultEnable ? 1 : 0
			const bConnected = b.item.defaultEnable ? 1 : 0
			if (aConnected !== bConnected) {
				return bConnected - aConnected
			}
			return a.index - b.index
		})
		.map(({ item }) => item)
}

export function getCategoryCounts<T extends IntegrationSummary>(
	items: readonly T[],
	searchQuery = '',
): Record<IntegrationCategory, number> {
	const normalizedQuery = searchQuery.trim().toLowerCase()
	const counts: Record<IntegrationCategory, number> = {
		all: 0,
		issue_tracking: 0,
		messaging: 0,
		infrastructure: 0,
		analytics_automation: 0,
	}

	for (const item of items) {
		if (!matchesSearchQuery(item, normalizedQuery)) {
			continue
		}
		const category = getIntegrationCategory(item.key, item.category)
		counts.all += 1
		counts[category] += 1
	}

	return counts
}

export function getConnectedCount<T extends IntegrationSummary>(
	items: readonly T[],
): number {
	return items.reduce(
		(total, item) => total + (item.defaultEnable ? 1 : 0),
		0,
	)
}
