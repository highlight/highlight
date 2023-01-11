import React from 'react'
import { Box } from '../Box/Box'

import * as styles from './styles.css'
import { Button, Text } from '../../components'

interface Page {
	page: React.ReactNode
	icon?: React.ReactElement
	badge?: React.ReactNode
}

type Props<T extends string> = styles.Variants & {
	pages: {
		[k: string]: Page
	}
	tab: T
	setTab: (tab: T) => void
	right?: React.ReactNode
	handleRef?: (ref: HTMLElement | null) => void
}

export const Tabs = function <T extends string>({
	pages,
	tab,
	setTab,
	right,
	handleRef,
}: Props<T>) {
	const [hoveredTab, setHoveredTab] = React.useState<string>()
	const currentPage = pages[tab]

	return (
		<Box display="flex" flexDirection="column" height="full" width="full">
			<Box
				px="8"
				display="flex"
				alignItems="center"
				justifyContent="space-between"
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
							paddingTop="4"
							gap="4"
							key={t}
							className={styles.controlBarButton}
							onMouseEnter={() => setHoveredTab(t)}
							onMouseLeave={() => setHoveredTab(undefined)}
							onClick={() => {
								setTab(t as T)
							}}
						>
							<Button
								iconLeft={pages[t].icon}
								className={styles.controlBarVariants({
									selected: t === tab,
								})}
							>
								<Text
									color={t === tab ? 'p9' : 'n11'}
									cssClass={styles.tabText}
								>
									{t}
									{pages[t].badge}
								</Text>
							</Button>
							<div
								className={styles.controlBarBottomVariants({
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
				<Box className={styles.pageWrapper}>
					{pages[tab].page}
					<Box ref={handleRef} className={styles.handle}>
						<Box className={styles.handleLine} />
					</Box>
				</Box>
			)}
		</Box>
	)
}
