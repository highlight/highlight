import { FaInfoCircle } from 'react-icons/fa'
import ReactMarkdown from 'react-markdown'
import styles from '../Docs.module.scss'

export const Callout = (props: { content: string }) => {
	return (
		<div className={styles.callout}>
			<div className={styles.calloutIcon}>
				<div className={styles.icon}>
					<FaInfoCircle />
				</div>
			</div>
			<div className={styles.calloutContent}>
				<div className={styles.contentRender}>
					<ReactMarkdown>{props.content}</ReactMarkdown>
				</div>
			</div>
		</div>
	)
}
