import { StaticImageData } from 'next/image'
import { DatadogSpec } from './datadog'
import { FullstorySpec } from './fullstory'
import { HotjarSpec } from './hotjar'
import { InspectletSpec } from './inspectlet'
import { LogRocketSpec } from './logrocket'
import { SentrySpec } from './sentry'
import { SmartlookSpec } from './smartlook'
import { Site24x7Spec } from './site24x7'
import { SprigSpec } from './sprig'
import { MouseflowSpec } from './mouseflow'
import { PendoSpec } from './pendo'
import { HeapSpec } from './heap'
import { LogicMonitorSpec } from './logicmonitor'
import { Last9Spec } from './last9'
import { AxiomSpec } from './axiom'
import { BetterStackSpec } from './better-stack'
import { HyperDxSpec } from './hyperdx'
import { Dash0Spec } from './dash0'

export type ComparisonTableRow = {
	feature: string
	highlight: 0 | 0.5 | 1 //0.5 represents 'coming soon'
	competitor: 0 | 1
	tooltip?: string
}

export type ComparisonTableSection = {
	title: string
	rows: ComparisonTableRow[]
}

export type CompetitorPara = {
	header: string
	body: string //Body is markdown so it can include links and styling
}

export type Competitor = {
	name: string
	type?: 'session-replay' | 'error-monitoring' | 'logging' //determines which hero image to display
	header: string
	subheader: string
	logoDesktop?: StaticImageData
	logoMobile?: StaticImageData
	sections: ComparisonTableSection[]
	paragraphs?: CompetitorPara[]
}

//Slug is stored as the key so we can get constant time lookups in GetStaticProps
export const COMPETITORS: { [k: string]: Competitor } = {
	'highlight-vs-logrocket': LogRocketSpec,
	'highlight-vs-hotjar': HotjarSpec,
	'highlight-vs-fullstory': FullstorySpec,
	'highlight-vs-smartlook': SmartlookSpec,
	'highlight-vs-inspectlet': InspectletSpec,
	'highlight-vs-datadog': DatadogSpec,
	'highlight-vs-sentry': SentrySpec,
	'highlight-vs-site24x7': Site24x7Spec,
	'highlight-vs-sprig': SprigSpec,
	'highlight-vs-mouseflow': MouseflowSpec,
	'highlight-vs-pendo': PendoSpec,
	'highlight-vs-heap': HeapSpec,
	'highlight-vs-logicmonitor': LogicMonitorSpec,
	'highlight-vs-last9': Last9Spec,
	'highlight-vs-axiom': AxiomSpec,
	'highlight-vs-better-stack': BetterStackSpec,
	'highlight-vs-hyperdx': HyperDxSpec,
	'highlight-vs-dash0': Dash0Spec,
}
