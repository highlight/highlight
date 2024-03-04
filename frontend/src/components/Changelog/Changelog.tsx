import clsx from 'clsx'
import { HTMLProps } from 'react'

import SvgSparklesIcon from '../../static/SparklesIcon'
import styles from './Changelog.module.css'

const Changelog = (props: HTMLProps<HTMLDivElement>) => {
	// @ts-expect-error
	Canny('initChangelog', {
		appID: '6106e922db58e766285b5206',
		position: 'top',
		align: 'left',
	})

	return (
		<div {...props} className={clsx(styles.container, props.className)}>
			<button className={clsx(styles.indicator)} data-canny-changelog>
				<SvgSparklesIcon className={clsx(styles.indicatorIcon)} />
			</button>
		</div>
	)
}

export default Changelog
