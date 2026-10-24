export interface PartitionedIntegrations<T> {
	connected: T[]
	available: T[]
}

/**
 * Splits integrations into the ones that are already connected and the ones
 * that are still available to connect, preserving their original order.
 */
export const partitionIntegrations = <T extends { defaultEnable?: boolean }>(
	integrations: T[],
): PartitionedIntegrations<T> => ({
	connected: integrations.filter((integration) => integration.defaultEnable),
	available: integrations.filter((integration) => !integration.defaultEnable),
})
