import { collapsibleContent } from '@components/CollapsibleSection/style.css'
import clsx from 'clsx'
import { PropsWithChildren } from 'react'
import ReactCollapsible from 'react-collapsible'
import { styledVerticalScrollbar } from 'style/common.css'

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
			contentInnerClassName={clsx(
				collapsibleContent,
				styledVerticalScrollbar,
			)}
		>
			{children}
		</ReactCollapsible>
	)
}

export default CollapsibleSection
