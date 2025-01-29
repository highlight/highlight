import { collapsibleContent } from '@components/CollapsibleSection/style.css'
import {
	Box,
	ButtonIcon,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
} from '@highlight-run/ui/components'
import clsx from 'clsx'
import { PropsWithChildren, useState } from 'react'
import ReactCollapsible from 'react-collapsible'

import { styledVerticalScrollbar } from '@/style/common.css'

const CollapsibleSection = function ({
	children,
	title,
	defaultOpen,
	hideBorder,
}: PropsWithChildren<{
	title: string | React.ReactNode
	defaultOpen?: boolean
	hideBorder?: boolean
}>) {
	const [expanded, setExpanded] = useState(defaultOpen || false)

	const trigger = (
		<Box
			py="8"
			px="12"
			bb={hideBorder || expanded ? undefined : 'secondary'}
			display="flex"
			justifyContent="space-between"
			alignItems="center"
		>
			{title}
			<Box display="flex" gap="4" alignItems="center">
				<ButtonIcon
					icon={
						expanded ? (
							<IconSolidCheveronUp size={12} />
						) : (
							<IconSolidCheveronDown size={12} />
						)
					}
					kind="secondary"
					size="minimal"
					emphasis="low"
				/>
			</Box>
		</Box>
	)

	return (
		<ReactCollapsible
			trigger={trigger}
			open={expanded}
			handleTriggerClick={() => setExpanded(!expanded)}
			transitionTime={150}
			contentInnerClassName={clsx(
				collapsibleContent,
				styledVerticalScrollbar,
			)}
		>
			{children}
			<Box
				width="full"
				borderBottom={hideBorder ? undefined : 'secondary'}
			/>
		</ReactCollapsible>
	)
}

export default CollapsibleSection
