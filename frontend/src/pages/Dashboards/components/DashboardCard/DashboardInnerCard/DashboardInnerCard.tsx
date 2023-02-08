import React from 'react'

import styles from './DashboardInnerCard.module.scss'

type Props = Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> & {
	noPadding?: boolean
	title?: string | React.ReactNode
	interactable?: boolean
	noTitleBottomMargin?: boolean
}

const DashboardInnerCard: React.FC<React.PropsWithChildren<Props>> = ({
	title,
	children,
	noPadding = false,
	interactable = false,
	noTitleBottomMargin,
	...props
}) => {
	return (
		<article
			{...props}
			className={clsx(styles.card, props.className, {
				[styles.noPadding]: noPadding,
				[styles.interactable]: interactable,
			})}
		>
			{title && (
				<div
					className={clsx(styles.titleContainer, {
						[styles.noTitleBottomMargin]:
							typeof title !== 'string' || noTitleBottomMargin,
					})}
				>
					{typeof title === 'string' ? <h3>{title}</h3> : title}
				</div>
			)}
			{children}
		</article>
	)
}

export default DashboardInnerCard

export const CardHeader: React.FC<React.PropsWithChildren<unknown>> = ({
	children,
}) => {
	return <h2 className={styles.cardHeader}>{children}</h2>
}

export const CardSubHeader: React.FC<React.PropsWithChildren<unknown>> = ({
	children,
}) => {
	return <p className={styles.cardSubHeader}>{children}</p>
}

export const CardForm: React.FC<
	React.PropsWithChildren<React.FormHTMLAttributes<HTMLFormElement>>
> = ({ children, ...props }) => {
	return (
		<form {...props} className={clsx(props.className, styles.cardForm)}>
			{children}
		</form>
	)
}

export const CardFormActionsContainer: React.FC<
	React.PropsWithChildren<unknown>
> = ({ children }) => {
	return <div className={styles.cardFormActionsContainer}>{children}</div>
}
