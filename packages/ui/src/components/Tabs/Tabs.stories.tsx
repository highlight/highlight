import { Meta } from '@storybook/react'

import { Box } from '../Box/Box'
import { IconSolidAcademicCap, IconSolidBeaker } from '../icons'
import { Stack } from '../Stack/Stack'
import { Tabs } from './Tabs'

export default {
	title: 'Components/Tabs',
	component: Tabs,
} as Meta<typeof Tabs>

export const Basic = () => (
	<Box mx="auto" display="flex" style={{ height: 600, width: 600 }}>
		<Tabs>
			<Tabs.List>
				<Tabs.Tab id="1">Tab 1</Tabs.Tab>
				<Tabs.Tab id="2" icon={<IconSolidBeaker />}>
					Tab 2
				</Tabs.Tab>
				<Tabs.Tab id="3" badgeText="13">
					Tab 3
				</Tabs.Tab>
				<Tabs.Tab id="4" icon={<IconSolidAcademicCap />} badgeText="14">
					Tab 4
				</Tabs.Tab>
			</Tabs.List>
			<Tabs.Panel id="1">
				<TabContent>Panel 1</TabContent>
			</Tabs.Panel>
			<Tabs.Panel id="2">
				<TabContent>Panel 2</TabContent>
			</Tabs.Panel>
			<Tabs.Panel id="3">
				<TabContent>Panel 3</TabContent>
			</Tabs.Panel>
			<Tabs.Panel id="4">
				<TabContent>Panel 4</TabContent>
			</Tabs.Panel>
		</Tabs>
	</Box>
)

const TabContent: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<Stack
			backgroundColor="elevated"
			flexGrow={1}
			direction="column"
			align="center"
			justify="center"
		>
			{children}
		</Stack>
	)
}
