import { StaticImageData } from 'next/image'
import { LogRocketSpec } from './logrocket'

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

export type Competitor = {
	name: string
	type?: 'session-replay' | 'error-monitoring' | 'logging' //determines which hero image to display
	header: string
	subheader: string
	logoDesktop?: StaticImageData
	logoMobile?: StaticImageData
	sections: ComparisonTableSection[]
	paragraphs?: {
		header: string
		body: string //Body is markdown so it can include links and styling
	}[]
}

//Slug is stored as the key so we can get constant time lookups in GetStaticProps
export const COMPETITORS: { [k: string]: Competitor } = {
	'highlight-vs-logrocket': LogRocketSpec,
}
