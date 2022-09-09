import useLocalStorage from '@rehooks/local-storage'
import classNames from 'classnames'
import React, { useState } from 'react'
import ReactCollapsible from 'react-collapsible'

import SvgChevronDownIcon from '../../static/ChevronDownIcon'
import styles from './Collapsible.module.scss'

interface InnerProps extends Props {
	setExpanded: (newValue: boolean) => void
	expanded: boolean
}

const CollapsibleImpl: React.FC<React.PropsWithChildren<InnerProps>> = ({
	title,
	children,
	contentClassName,
	parentClassName,
	stacked,
	expanded,
	setExpanded,
	...props
}) => {
	return (
		<ReactCollapsible
			{...props}
			trigger={
				<div
					className={classNames(styles.header, {
						[styles.collapsed]: !expanded,
					})}
				>
					<h2
						className={classNames({
							[styles.collapsed]: !expanded,
						})}
					>
						{title}
					</h2>
					<SvgChevronDownIcon
						className={classNames({ [styles.expanded]: expanded })}
					/>
				</div>
			}
			transitionTime={150}
			classParentString={
				stacked
					? classNames(styles.collapsibleStacked, parentClassName)
					: classNames(styles.collapsible, parentClassName)
			}
			handleTriggerClick={() => {
				setExpanded(!expanded)
			}}
			open={expanded}
		>
			<div className={classNames(styles.content, contentClassName)}>
				{children}
			</div>
		</ReactCollapsible>
	)
}

interface Props {
	title: string | React.ReactNode
	/** A unique identifier for this collapsible. This should be used if title is a ReactNode. */
	id?: string
	contentClassName?: string
	parentClassName?: string
	defaultOpen?: boolean
	stacked?: boolean
}

export const StatelessCollapsible: React.FC<React.PropsWithChildren<Props>> = ({
	title,
	children,
	contentClassName,
	parentClassName,
	stacked = false,
	defaultOpen = false,
	...props
}) => {
	const [expanded, setExpanded] = useState(defaultOpen)

	return (
		<CollapsibleImpl
			title={title}
			contentClassName={contentClassName}
			parentClassName={parentClassName}
			expanded={expanded}
			setExpanded={setExpanded}
			stacked={stacked}
			{...props}
		>
			{children}
		</CollapsibleImpl>
	)
}

const Collapsible: React.FC<React.PropsWithChildren<Props>> = ({
	title,
	children,
	contentClassName,
	parentClassName,
	id,
	defaultOpen = false,
	...props
}) => {
	const [expanded, setExpanded] = useLocalStorage(
		`highlight-collapsible-state-${id || title}`,
		defaultOpen,
	)

	return (
		<CollapsibleImpl
			title={title}
			contentClassName={contentClassName}
			parentClassName={parentClassName}
			expanded={expanded}
			setExpanded={setExpanded}
			{...props}
		>
			{children}
		</CollapsibleImpl>
	)
}

export default Collapsible
