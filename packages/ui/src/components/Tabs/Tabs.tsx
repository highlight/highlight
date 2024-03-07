import React from 'react'

import { Button } from '../../components/Button/Button'
import { Text } from '../../components/Text/Text'
import { Box } from '../Box/Box'
import * as styles from './styles.css'

export interface Page {
	page: React.ReactNode
	icon?: React.ReactElement
	badge?: React.ReactNode
}

type Props<T extends string> = {
	pages: {
		[k: string]: Page
	}
	tab: T
	right?: React.ReactNode
	setTab: (tab: T) => void
	handleRef?: (ref: HTMLElement | null) => void

	// These props have been added to override defaults that prevent us from
	// implementing the UX as designed. They are temporary and will be removed
	// when we rebuild tabs: https://github.com/highlight/highlight/issues/5771
	noHandle?: boolean
	containerClass?: string
	tabsContainerClass?: string
	pageContainerClass?: string
}

export const Tabs = function <T extends string>({
	pages,
	tab,
	right,
	containerClass,
	tabsContainerClass,
	pageContainerClass,
	noHandle = false,
	setTab,
	handleRef,
}: Props<T>) {
	const [hoveredTab, setHoveredTab] = React.useState<string>()
	const currentPage = pages[tab]

	return (
		<Box
			display="flex"
			flexDirection="column"
			height="full"
			width="full"
			cssClass={containerClass}
		>
			<Box
				px="8"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
				cssClass={tabsContainerClass}
			>
				<Box
					gap="6"
					display="flex"
					alignItems="center"
					justifyContent="flex-start"
				>
					{Object.keys(pages).map((t) => (
						<Box
							display="flex"
							flexDirection="column"
							justifyContent="center"
							gap="2"
							key={t}
							cssClass={styles.controlBarButton}
							onMouseEnter={() => setHoveredTab(t)}
							onMouseLeave={() => setHoveredTab(undefined)}
							onClick={() => {
								setTab(t as T)
							}}
						>
							<Button
								iconLeft={pages[t].icon}
								cssClass={styles.controlBarVariants({
									selected: t === tab,
								})}
							>
								<Box display="flex" gap="6">
									<Text
										color={t === tab ? 'p9' : 'n11'}
										cssClass={styles.tabText}
									>
										{t}
									</Text>
									{pages[t].badge}
								</Box>
							</Button>
							<Box
								cssClass={styles.controlBarBottomVariants({
									hovered: t === hoveredTab,
									selected: t === tab,
								})}
							/>
						</Box>
					))}
				</Box>
				{right}
			</Box>
			{currentPage && (
				<Box cssClass={pageContainerClass ?? styles.pageWrapper}>
					{pages[tab].page}
					{!noHandle && (
						<Box
							ref={handleRef}
							cssClass={[
								styles.handle,
								{ [styles.grabbable]: !!handleRef },
							]}
						>
							<Box cssClass={styles.handleLine} />
						</Box>
					)}
				</Box>
			)}
		</Box>
	)
}
