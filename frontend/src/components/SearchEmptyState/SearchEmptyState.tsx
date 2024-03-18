import clsx from 'clsx'
import { ReactNode } from 'react'

import { ReactComponent as EmptyState } from '../../static/empty-state.svg'
import styles from './SearchEmptyState.module.css'

const { emptyStateSection, emptyStateWrapper, emptySubTitle, emptyTitle } =
	styles

interface Props {
	item: string
	customTitle?: string
	customDescription?: string | ReactNode
	className?: string
}

export const SearchEmptyState = ({
	item,
	customDescription,
	customTitle,
	className,
}: Props) => (
	<div className={clsx(styles.newFeedStyles, className)}>
		<div className={emptyStateWrapper}>
			<div style={{ marginRight: 80 }} className={emptyStateSection}>
				<EmptyState preserveAspectRatio="xMinYMin" />
			</div>
			<div style={{ marginLeft: 80 }} className={emptyStateSection}>
				<EmptyState preserveAspectRatio="xMinYMin" />
			</div>
			<div style={{ marginRight: 80 }} className={emptyStateSection}>
				<EmptyState preserveAspectRatio="xMinYMin" />
			</div>
		</div>
		<h3 className={emptyTitle}>
			{customTitle
				? customTitle
				: `Couldn't find any relevant ${item} 😔`}
		</h3>
		<p className={emptySubTitle}>
			{customDescription ? (
				customDescription
			) : (
				<>
					We couldn't find any {item} for your search. If you think
					something's wrong, feel free to reach out to us!
				</>
			)}
		</p>
	</div>
)
