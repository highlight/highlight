import { collapsibleContent } from '@components/CollapsibleSection/style.css'
import {
	Box,
	ButtonIcon,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	Text,
} from '@highlight-run/ui/components'
import clsx from 'clsx'
import { PropsWithChildren, useState } from 'react'
import ReactCollapsible from 'react-collapsible'

import { styledVerticalScrollbar } from '@/style/common.css'

const CollapsibleSection = function ({
	children,
	title,
}: PropsWithChildren<{
	title: string
}>) {
	const [expanded, setExpanded] = useState(false)

	const trigger = (
		<Box
			py="8"
			px="12"
			bb={expanded ? undefined : 'secondary'}
			display="flex"
			justifyContent="space-between"
			alignItems="center"
		>
			<Text
				color="secondaryContentOnEnabled"
				as="span"
				size="small"
				weight="medium"
			>
				{title}
			</Text>

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
		</ReactCollapsible>
	)
}

export default CollapsibleSection
