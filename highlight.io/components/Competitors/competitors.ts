import { StaticImageData } from 'next/image'
import { FullstorySpec } from './fullstory'
import { HotjarSpec } from './hotjar'
import { InspectletSpec } from './inspectlet'
import { LogRocketSpec } from './logrocket'
import { SmartlookSpec } from './smartlook'

export type ComparisonTableRow = {
	feature: string
	highlight: 0 | 0.5 | 1
	competitor: 0 | 1
	tooltip?: string
}

export type ComparisonTableSection = {
	title: string
	rows: ComparisonTableRow[]
}

export type Competitor = {
	name: string
	header: string
	subheader: string
	logo?: StaticImageData
	sections: ComparisonTableSection[]
	paragraphs?: {
		header: string
		body: string //Body is markdown so it can include links and styling
	}[]
}

//Slug is stored as the key so we can get constant time lookups in GetStaticProps
export const COMPETITORS: { [k: string]: Competitor } = {
	'highlight-vs-logrocket': LogRocketSpec,
	'highlight-vs-hotjar': HotjarSpec,
	'highlight-vs-fullstory': FullstorySpec,
	'highlight-vs-smartlook': SmartlookSpec,
	'highlight-vs-inspectlet': InspectletSpec,
}
