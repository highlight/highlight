import SvgCopyIcon from '@icons/CopyIcon'
import { message } from 'antd'
import clsx from 'clsx'
import React, { ReactNode } from 'react'

import Button from '../Button/Button/Button'
import styles from './CopyText.module.scss'

interface Props {
	text: string
	className?: string
	inline?: boolean
	custom?: ReactNode
	onCopyTooltipText: string
}

const CopyText: React.FC<React.PropsWithChildren<Props>> = ({
	text,
	className,
	inline,
	custom,
	onCopyTooltipText,
}) => {
	const onCopyHandler = () => {
		navigator.clipboard.writeText(text)
		message.success(onCopyTooltipText)
	}

	if (inline) {
		return (
			<div className={styles.inlineContainer}>
				{custom ? custom : <span>{text}</span>}
				<Button
					trackingId="CopyTextMinimal"
					iconButton
					type="text"
					className={styles.copyButton}
					onClick={onCopyHandler}
				>
					<SvgCopyIcon />
				</Button>
			</div>
		)
	}

	return (
		<div className={clsx(className, styles.container)}>
			<span className={styles.link}>{text}</span>
			<Button
				type="primary"
				trackingId="CopyText"
				className={styles.copyButton}
				onClick={onCopyHandler}
			>
				Copy
			</Button>
		</div>
	)
}

export default CopyText
