import { message } from 'antd'
import { useState } from 'react'
import { FaCopy } from 'react-icons/fa'

import Tooltip from '../../../../components/Tooltip/Tooltip'
import styles from './CurrentUrlBar.module.css'

export const CurrentUrlBar = ({ url }: { url: string }) => {
	const [hover, setHover] = useState(false)
	return (
		<div
			className={styles.urlBarWrapper}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
		>
			<Tooltip title={url}>
				<a
					className={styles.urlLink}
					target="_blank"
					href={url}
					rel="noreferrer"
				>
					{url}
				</a>
			</Tooltip>
			<FaCopy
				style={{
					opacity: hover ? 1 : 0,
				}}
				className={styles.copyIcon}
				onClick={() => {
					navigator.clipboard.writeText(url)
					message.success('Copied url to clipboard')
				}}
			/>
		</div>
	)
}
