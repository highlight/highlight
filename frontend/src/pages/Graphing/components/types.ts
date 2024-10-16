export type FunnelDisplay = 'Bar Chart' | 'Line Chart' | 'Vertical Funnel'
export const FUNNEL_DISPLAY: FunnelDisplay[] = [
	'Bar Chart',
	'Line Chart',
	// TODO(vkorolik) <FunnelChart/> is not yet supported
	// 'Vertical Funnel'
] as const
