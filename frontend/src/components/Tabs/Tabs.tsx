// eslint-disable-next-line no-restricted-imports
import useLocalStorage from '@rehooks/local-storage'
import { isRenderable } from '@util/react'
import { Tabs as AntDesignTabs, TabsProps } from 'antd'
import clsx from 'clsx'
import React, { useEffect } from 'react'
const { TabPane } = AntDesignTabs

import styles from './Tabs.module.css'

export interface TabItem {
	key: string
	title?: string | React.ReactNode // If undefined, `key` will be used as the title
	panelContent: React.ReactNode
	disabled?: boolean
	hidden?: boolean
}

type Props = Pick<
	TabsProps,
	'animated' | 'tabBarExtraContent' | 'centered' | 'onChange'
> & {
	tabs: TabItem[]
	/** A unique value to distinguish this tab with other tabs. */
	id: string
	/** Whether the tab contents has the default padding. */
	noPadding?: boolean
	/** Whether the tabs overflow-y should be unset */
	unsetOverflowY?: boolean
	/** Whether the tab headers have the default padding. */
	noHeaderPadding?: boolean
	border?: boolean
	/** An HTML id to attach to the tabs. */
	tabsHtmlId?: string
	className?: string
	tabBarExtraContentClassName?: string
	activeKeyOverride?: string
}

const Tabs = ({
	tabs,
	id,
	noPadding = false,
	noHeaderPadding = false,
	border = false,
	unsetOverflowY = false,
	tabBarExtraContent,
	tabsHtmlId,
	className,
	tabBarExtraContentClassName,
	activeKeyOverride,
	...props
}: Props) => {
	const [activeTab, setActiveTab] = useLocalStorage(
		`tabs-${id}-active-tab`,
		tabs[0].key || '0',
	)

	/**
	 * In cases where we render tabs conditionally, a tab may no longer be selectable because it's not rendered.
	 * @example We have Tab A, B, C
	 * On one visit, all 3 tabs are visible
	 * On a second visit, only Tab A and C are visible but Tab B was the last active tab.
	 * On the second visit, the tabs will render an empty tab because Tab B is not visible.
	 * In this case, we'll default to the first tab.
	 */
	useEffect(() => {
		const activeTabIndex = tabs.findIndex((tab) => tab.key === activeTab)

		if (activeTabIndex === -1) {
			setActiveTab(tabs[0].key)
		}
	}, [activeTab, setActiveTab, tabs])

	const activeKey =
		activeKeyOverride !== undefined ? activeKeyOverride : activeTab

	return (
		<AntDesignTabs
			{...props}
			activeKey={activeKey}
			defaultActiveKey={activeKey}
			onChange={(activeKey) => {
				if (props.onChange) {
					props.onChange(activeKey)
				}
				setActiveTab(activeKey)
			}}
			tabBarExtraContent={
				isRenderable(tabBarExtraContent) ? (
					<div
						className={clsx(
							styles.extraContentContainer,
							tabBarExtraContentClassName,
							{
								[styles.withHeaderPadding]: !noHeaderPadding,
							},
						)}
					>
						{tabBarExtraContent}
					</div>
				) : (
					tabBarExtraContent
				)
			}
			id={tabsHtmlId}
			className={clsx(styles.tabs, className, {
				[styles.noHeaderPadding]: noHeaderPadding,
				[styles.border]: border,
			})}
		>
			{tabs.map(({ panelContent, title, key, disabled, hidden }) => {
				if (hidden) {
					return null
				}
				return (
					<TabPane
						key={key}
						tab={title ?? key}
						className={clsx(styles.tabPane, {
							[styles.withPadding]: !noPadding,
							[styles.unsetOverflowY]: unsetOverflowY,
						})}
						disabled={disabled}
					>
						{panelContent}
					</TabPane>
				)
			})}
		</AntDesignTabs>
	)
}

export default Tabs
