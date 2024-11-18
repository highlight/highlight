import { Listbox } from '@headlessui/react'
import { DocumentIcon, DocumentTextIcon } from '@heroicons/react/20/solid'
import classNames from 'classnames'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import SvgChevronDownIcon from '../../../public/images/ChevronDownIcon'
import { Typography } from '../../common/Typography/Typography'
import styles from '../Docs.module.scss'

const DOCS_TYPES: Array<{
	id: number
	name: string
	icon: React.ReactNode
	url: string
	baseUrl: string
}> = [
	{
		id: 1,
		name: 'General Docs',
		icon: <DocumentIcon />,
		url: '/docs/general/welcome',
		baseUrl: '/docs/general',
	},
	{
		id: 1,
		name: 'Getting Started',
		icon: <DocumentTextIcon />,
		url: '/docs/getting-started/overview',
		baseUrl: '/docs/getting-started',
	},
	{
		id: 2,
		name: 'Node.js SDK',
		icon: <DocumentTextIcon />,
		url: '/docs/sdk/nodejs',
		baseUrl: '/docs/sdk/nodejs',
	},
	{
		id: 3,
		name: 'Next.js SDK',
		icon: <DocumentTextIcon />,
		url: '/docs/sdk/nextjs',
		baseUrl: '/docs/sdk/nodejs',
	},
	{
		id: 4,
		name: 'Hono SDK',
		icon: <DocumentTextIcon />,
		url: '/docs/sdk/hono',
		baseUrl: '/docs/sdk/nodejs',
	},
	{
		id: 5,
		name: 'Cloudflare Worker SDK',
		icon: <DocumentTextIcon />,
		url: '/docs/sdk/cloudflare',
		baseUrl: '/docs/sdk/nodejs',
	},
	{
		id: 6,
		name: 'Python SDK',
		icon: <DocumentTextIcon />,
		url: '/docs/sdk/python',
		baseUrl: '/docs/sdk/python',
	},
	{
		id: 7,
		name: 'Golang SDK',
		icon: <DocumentTextIcon />,
		url: '/docs/sdk/go',
		baseUrl: '/docs/sdk/go',
	},
	{
		id: 8,
		name: 'Java SDK',
		icon: <DocumentTextIcon />,
		url: '/docs/sdk/java',
		baseUrl: '/docs/sdk/java',
	},
	{
		id: 9,
		name: 'Rust SDK',
		icon: <DocumentTextIcon />,
		url: '/docs/sdk/rust',
		baseUrl: '/docs/sdk/rust',
	},
	{
		id: 10,
		name: 'Client SDK',
		icon: <DocumentTextIcon />,
		url: '/docs/sdk/client',
		baseUrl: '/docs/sdk/client',
	},
	{
		id: 11,
		name: 'Ruby SDK',
		icon: <DocumentTextIcon />,
		url: '/docs/sdk/ruby',
		baseUrl: '/docs/sdk/ruby',
	},
]

const findSelectedDocByArrayPath = (arrayPath: string[]) => {
	const index = DOCS_TYPES.findIndex((doc) => {
		const arrayPathToMatch = doc.baseUrl.replace('/docs/', '')
		return arrayPath.join('/').startsWith(arrayPathToMatch)
	})
	return index === -1 ? 0 : index
}

function DocSelect() {
	const router = useRouter()
	const [selectedDocs, setSelectedDocs] = useState(
		DOCS_TYPES[
			findSelectedDocByArrayPath(
				Array.isArray(router.query.doc) ? router.query.doc : [],
			)
		],
	)

	useEffect(() => {
		setSelectedDocs(
			DOCS_TYPES[
				findSelectedDocByArrayPath(
					Array.isArray(router.query.doc) ? router.query.doc : [],
				)
			],
		)
	}, [router.query.doc])

	return (
		<Listbox value={selectedDocs} onChange={setSelectedDocs}>
			<Listbox.Button className={styles.docSelect}>
				<div className={styles.docSelectText}>
					<span className={styles.tocIcon}>{selectedDocs.icon}</span>
					<Typography type="copy3" emphasis>
						{selectedDocs.name}
					</Typography>
				</div>
				<SvgChevronDownIcon
					className={classNames(styles.tocIcon, styles.chevronDown)}
				/>
			</Listbox.Button>
			<Listbox.Options className={styles.docSelectList}>
				{DOCS_TYPES.map((doc) => (
					<Listbox.Option
						key={doc.id}
						value={doc}
						className={classNames(styles.tocRow)}
						onClick={() => {
							setSelectedDocs(doc)
							router.push(doc.url)
						}}
					>
						<div className={styles.tocChild}>
							<div className={styles.tocIcon}>{doc.icon}</div>
							<Typography type="copy3">{doc.name}</Typography>
						</div>
					</Listbox.Option>
				))}
			</Listbox.Options>
		</Listbox>
	)
}

export default DocSelect
