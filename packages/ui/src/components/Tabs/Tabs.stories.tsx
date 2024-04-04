import { Meta } from '@storybook/react'
import { useState } from 'react'

import { Box } from '../Box/Box'
import { Button } from '../Button/Button'
import { Heading } from '../Heading/Heading'
import {
	IconSolidAcademicCap,
	IconSolidBeaker,
	IconSolidLogs,
	IconSolidTraces,
} from '../icons'
import { Stack } from '../Stack/Stack'
import { Tabs } from './Tabs'

export default {
	title: 'Components/Tabs',
	component: Tabs,
} as Meta<typeof Tabs>

enum TabIds {
	ONE = '1',
	TWO = '2',
	THREE = '3',
	FOUR = '4',
}

export const Basic = () => {
	const [activeTab, setActiveTab] = useState<TabIds>(TabIds.ONE)

	return (
		<Box mx="auto" display="flex" style={{ height: 600, width: 600 }}>
			<Tabs selectedId={activeTab} onChange={setActiveTab}>
				<Tabs.List>
					<Tabs.Tab id={TabIds.ONE}>Tab 1</Tabs.Tab>
					<Tabs.Tab id={TabIds.TWO} icon={<IconSolidBeaker />}>
						Tab 2
					</Tabs.Tab>
					<Tabs.Tab id={TabIds.THREE} badgeText="13">
						Tab 3
					</Tabs.Tab>
					<Tabs.Tab
						id={TabIds.FOUR}
						icon={<IconSolidAcademicCap />}
						badgeText="14"
					>
						Tab 4
					</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel id={TabIds.ONE}>
					<TabContent>
						Panel 1{' '}
						<Button onClick={() => setActiveTab(TabIds.TWO)}>
							Go forward
						</Button>
					</TabContent>
				</Tabs.Panel>
				<Tabs.Panel id={TabIds.TWO}>
					<TabContent>
						Panel 2
						<Button onClick={() => setActiveTab(TabIds.ONE)}>
							Go back
						</Button>
						<Button onClick={() => setActiveTab(TabIds.THREE)}>
							Go forward
						</Button>
					</TabContent>
				</Tabs.Panel>
				<Tabs.Panel id={TabIds.THREE}>
					<TabContent>
						Panel 3
						<Button onClick={() => setActiveTab(TabIds.TWO)}>
							Go back
						</Button>
						<Button onClick={() => setActiveTab(TabIds.FOUR)}>
							Go forward
						</Button>
					</TabContent>
				</Tabs.Panel>
				<Tabs.Panel id={TabIds.FOUR}>
					<TabContent>
						Panel 4
						<Button onClick={() => setActiveTab(TabIds.THREE)}>
							Go back
						</Button>
					</TabContent>
				</Tabs.Panel>
			</Tabs>
		</Box>
	)
}

export const Sizes = () => (
	<Box>
		<Heading level="h3" mb="16">
			Small (default)
		</Heading>
		<Box display="flex" style={{ height: 300 }}>
			<Tabs>
				<Tabs.List>
					<Tabs.Tab id="1" icon={<IconSolidAcademicCap />}>
						Info
					</Tabs.Tab>
					<Tabs.Tab id="2" icon={<IconSolidLogs />} badgeText="13">
						Logs
					</Tabs.Tab>
					<Tabs.Tab id="3" icon={<IconSolidTraces />} badgeText="4">
						Trace
					</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel id="1">
					<TabContent>Info</TabContent>
				</Tabs.Panel>
				<Tabs.Panel id="2">
					<TabContent>Logs</TabContent>
				</Tabs.Panel>
				<Tabs.Panel id="3">
					<TabContent>Trace</TabContent>
				</Tabs.Panel>
			</Tabs>
		</Box>

		<Heading level="h3" mt="32" mb="16">
			Extra Small
		</Heading>
		<Box display="flex" style={{ height: 300 }}>
			<Tabs size="xs">
				<Tabs.List>
					<Tabs.Tab id="1" icon={<IconSolidAcademicCap />}>
						Info
					</Tabs.Tab>
					<Tabs.Tab id="2" icon={<IconSolidLogs />} badgeText="13">
						Logs
					</Tabs.Tab>
					<Tabs.Tab id="3" icon={<IconSolidTraces />} badgeText="4">
						Trace
					</Tabs.Tab>
				</Tabs.List>
				<Tabs.Panel id="1">
					<TabContent>Info</TabContent>
				</Tabs.Panel>
				<Tabs.Panel id="2">
					<TabContent>Logs</TabContent>
				</Tabs.Panel>
				<Tabs.Panel id="3">
					<TabContent>Trace</TabContent>
				</Tabs.Panel>
			</Tabs>
		</Box>
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
