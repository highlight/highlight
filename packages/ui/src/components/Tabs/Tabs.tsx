import * as Ariakit from '@ariakit/react'
import { useState } from 'react'

import { Badge } from '../Badge/Badge'
import { Box, PaddingProps } from '../Box/Box'
import { Stack } from '../Stack/Stack'
import { Props as TagProps, Tag } from '../Tag/Tag'

type Props = React.PropsWithChildren & {
	defaultSelectedId?: Ariakit.TabProviderProps['defaultSelectedId']
	selectedId?: Ariakit.TabProviderProps['selectedId']
	onChange?: Ariakit.TabStoreProps['setSelectedId']
}

type TabsComponent = React.FC<Props> & {
	Tab: typeof Tab
	List: typeof TabList
	Panel: typeof TabPanel
}

export const Tabs: TabsComponent = ({
	children,
	defaultSelectedId,
	selectedId,
	onChange,
}) => {
	const tabsStore = Ariakit.useTabStore({
		setSelectedId: (id) => {
			if (onChange) {
				onChange(id)
			}
		},
	})

	return (
		<Ariakit.TabProvider
			store={tabsStore}
			defaultSelectedId={defaultSelectedId}
			selectedId={selectedId}
		>
			<Stack direction="column" flexGrow={1} gap="0" width="full">
				{children}
			</Stack>
		</Ariakit.TabProvider>
	)
}

type TabListProps = React.PropsWithChildren &
	Ariakit.TabListProps &
	PaddingProps

const TabList: React.FC<TabListProps> = ({ children, ...props }) => {
	return (
		<Ariakit.TabList
			{...props}
			render={
				<Stack
					align="center"
					direction="row"
					gap="16"
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
	id: string
	badgeText?: string
	icon?: TagProps['icon']
}

const Tab: React.FC<TabProps> = ({ badgeText, children, icon, ...props }) => {
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
						size="large"
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

type TabPanelProps = React.PropsWithChildren<Ariakit.TabPanelProps>

const TabPanel: React.FC<TabPanelProps> = ({ children, ...props }) => {
	return (
		<Ariakit.TabPanel
			{...props}
			render={
				<Stack direction="column" flexGrow={1} id={props.id}>
					{children}
				</Stack>
			}
		/>
	)
}

Tabs.Tab = Tab
Tabs.List = TabList
Tabs.Panel = TabPanel
