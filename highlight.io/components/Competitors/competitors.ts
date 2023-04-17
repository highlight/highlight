import { StaticImageData } from 'next/image'
import { LogRocketSpec } from './logrocket'

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
	slug: string
	name: string
	header: string
	subheader: string
	subHeader2: string
	logo?: StaticImageData
	sections: ComparisonTableSection[]
	paragraphs?: {
		header: string
		//Body is markdown so it can include links and styling
		body: string
	}[]
}

export const COMPETITORS: { [k: string]: Competitor } = {
	logrocket: LogRocketSpec,
}
