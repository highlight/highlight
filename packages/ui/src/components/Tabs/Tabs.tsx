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
	default?: T
	right?: React.ReactNode
	onChange?: (tab: T) => void
}

export const Tabs = function <T extends string>(props: Props<T>) {
	const [tab, setTab] = React.useState<T>(props.default)
	const [hoveredTab, setHoveredTab] = React.useState<string>()
	const currentPage = props.pages[tab]

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
					{Object.keys(props.pages).map((t) => (
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
								if (props.onChange) {
									props.onChange(t as T)
								}
								setTab(t as T)
							}}
						>
							<Button
								iconLeft={props.pages[t].icon}
								className={styles.controlBarVariants({
									selected: t === tab,
								})}
							>
								<Text
									color={
										t === tab ? 'purpleP9' : 'neutralN11'
									}
									cssClass={styles.tabText}
								>
									{t}
									{props.pages[t].badge}
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
				{props.right}
			</Box>
			{currentPage && (
				<Box className={styles.pageWrapper}>
					{props.pages[tab].page}
				</Box>
			)}
		</Box>
	)
}
