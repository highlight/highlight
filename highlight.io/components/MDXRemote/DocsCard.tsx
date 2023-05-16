import Link from 'next/link'
import { Typography } from '../../components/common/Typography/Typography'
import styles from '../../components/Docs/Docs.module.scss'

type Props = {
	children: React.ReactNode
	title: string
	href: string
	path: string
}

export function DocsCard({ children, title, path, href }: Props) {
	return (
		<Link href={href} className={styles.docsCard}>
			<Typography type="copy2" emphasis>
				{title}
			</Typography>
			<Typography type="copy2">{children}</Typography>
		</Link>
	)
}
