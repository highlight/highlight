import * as Ariakit from '@ariakit/react'
import { createContext, useContext, useState } from 'react'

import { Badge } from '../Badge/Badge'
import { Box, BoxProps, PaddingProps } from '../Box/Box'
import { Stack } from '../Stack/Stack'
import { Tag, Props as TagProps } from '../Tag/Tag'

export const TabsContext = createContext({
	size: 'sm',
})

type Props<T = string> = React.PropsWithChildren & {
	defaultSelectedId?: T
	selectedId?: T
	size?: 'xs' | 'sm'
	onChange?: (id: T) => void
	scrollable?: boolean
}

export const Tabs = <T extends string = string>({
	children,
	defaultSelectedId,
	selectedId,
	size = 'sm',
	onChange,
	scrollable,
}: Props<T>) => {
	const tabsStore = Ariakit.useTabStore({
		defaultSelectedId,
		setSelectedId: (id) => {
			if (onChange) {
				onChange(id as T)
			}
		},
	})

	return (
		<TabsContext.Provider value={{ size }}>
			<Ariakit.TabProvider store={tabsStore} selectedId={selectedId}>
				<Stack
					direction="column"
					flexGrow={1}
					gap="0"
					width="full"
					overflowY={scrollable ? 'hidden' : undefined}
				>
					{children}
				</Stack>
			</Ariakit.TabProvider>
		</TabsContext.Provider>
	)
}

type TabListProps = React.PropsWithChildren &
	Ariakit.TabListProps &
	PaddingProps & {
		gap?: BoxProps['gap']
	}

const TabList: React.FC<TabListProps> = ({
	children,
	gap = '16',
	...props
}) => {
	return (
		<Ariakit.TabList
			{...props}
			render={
				<Stack
					align="center"
					direction="row"
					gap={gap}
					borderBottom="dividerWeak"
				>
					{children}
				</Stack>
			}
		/>
	)
}

type TabProps = Ariakit.TabProps & {
	children: string
	badgeText?: string
	icon?: TagProps['icon']
}

const Tab: React.FC<TabProps> = ({ badgeText, children, icon, ...props }) => {
	const { size } = useContext(TabsContext)
	const tabContext = Ariakit.useTabContext()!
	const selected = tabContext.useState('selectedId') === props.id
	const [hovered, setHovered] = useState(false)
	const showBorder = hovered || selected

	return (
		<Ariakit.Tab
			{...props}
			render={
				<Box
					display="flex"
					gap="4"
					pb="6"
					flexDirection="row"
					alignItems="center"
					position="relative"
					cursor="pointer"
					onMouseEnter={() => setHovered(true)}
					onMouseLeave={() => setHovered(false)}
				>
					<Tag
						shape="basic"
						size={size === 'xs' ? 'medium' : 'large'}
						emphasis="low"
						kind={selected ? 'primary' : 'secondary'}
						icon={icon}
					>
						{children}
					</Tag>

					{badgeText && (
						<Badge
							label={badgeText}
							variant={selected ? 'purple' : 'gray'}
							shape="basic"
							size="small"
						/>
					)}

					{showBorder && (
						<Box
							position="absolute"
							backgroundColor={selected ? 'p9' : 'n7'}
							borderTopLeftRadius="2"
							borderTopRightRadius="2"
							width="full"
							style={{
								height: 2,
								bottom: 0,
								left: 0,
								right: 0,
								width: '100%',
							}}
						/>
					)}
				</Box>
			}
		/>
	)
}

type TabPanelProps = React.PropsWithChildren<Ariakit.TabPanelProps> & {
	scrollable?: boolean
}

const TabPanel: React.FC<TabPanelProps> = ({
	children,
	scrollable,
	unmountOnHide = true,
	...props
}) => {
	return (
		<Ariakit.TabPanel
			{...props}
			unmountOnHide={unmountOnHide}
			render={
				<Stack
					direction="column"
					flexGrow={1}
					id={props.id}
					overflowY={scrollable ? 'auto' : undefined}
				>
					{children}
				</Stack>
			}
		/>
	)
}

Tabs.Tab = Tab
Tabs.List = TabList
Tabs.Panel = TabPanel
Tabs.useStore = Ariakit.useTabStore
Tabs.useContext = Ariakit.useTabContext
