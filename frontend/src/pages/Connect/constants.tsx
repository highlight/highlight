import {
	IconSolidCheck,
	IconSolidLightningBolt,
	IconSolidLogs,
	IconSolidPlayCircle,
	IconSolidTraces,
} from '@highlight-run/ui/components'

import {
	useClientIntegration,
	useLogsIntegration,
	useServerIntegration,
	useTracesIntegration,
} from '@/util/integrated'

export enum ProductArea {
	sessions = 'Sessions',
	errors = 'Errors',
	logs = 'Logs',
	traces = 'Traces',
	merics = 'Metrics',
}

type ProductAreaInfo = {
	title: string
	link: string
	icon: React.ReactNode
	useIntegration: () => any
	hidden?: boolean
}

export const PRODUCT_AREAS: Record<ProductArea, ProductAreaInfo> = {
	[ProductArea.sessions]: {
		title: 'Sessions',
		link: '/sessions',
		icon: <IconSolidPlayCircle />,
		useIntegration: useClientIntegration,
	},
	[ProductArea.errors]: {
		title: 'Errors',
		link: '/errors',
		icon: <IconSolidLightningBolt />,
		useIntegration: useServerIntegration,
	},
	[ProductArea.logs]: {
		title: 'Logs',
		link: '/logs',
		icon: <IconSolidLogs />,
		useIntegration: useLogsIntegration,
	},
	[ProductArea.traces]: {
		title: 'Traces',
		link: '/traces',
		icon: <IconSolidTraces />,
		useIntegration: useTracesIntegration,
	},
	[ProductArea.merics]: {
		title: 'Metrics',
		link: '/metrics',
		icon: <IconSolidCheck />,
		useIntegration: () => ({ integrated: false }),
		hidden: true,
	},
}

export const PRODUCT_AREA_KEYS = Object.values(ProductArea)
