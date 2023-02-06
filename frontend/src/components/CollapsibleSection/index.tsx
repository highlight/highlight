import { collapsibleContent } from '@components/CollapsibleSection/style.css'
import clsx from 'clsx'
import { PropsWithChildren } from 'react'
import ReactCollapsible from 'react-collapsible'
import { styledScrollbar } from 'style/common.css'

const CollapsibleSection = function ({
	children,
	expanded,
	setExpanded,
	title,
}: PropsWithChildren<{
	expanded: boolean
	setExpanded: (expanded: boolean) => void
	title: React.ReactElement
}>) {
	return (
		<ReactCollapsible
			trigger={title}
			open={expanded}
			handleTriggerClick={() => setExpanded(!expanded)}
			transitionTime={150}
			contentInnerClassName={clsx(collapsibleContent, styledScrollbar)}
		>
			{children}
		</ReactCollapsible>
	)
}

export default CollapsibleSection
