import classNames from 'classnames'
import React from 'react'

import devStyles from '../DevToolsWindow.module.scss'

const DISPLAY_NAMES: { [key: string]: string } = {
	iframe: 'iFrame',
	other: 'Other',
	css: 'CSS',
	xmlhttprequest: 'XHR',
	script: 'Script',
	link: 'Link',
	fetch: 'Fetch',
} as const

export const getNetworkResourcesDisplayName = (value: string): string => {
	switch (true) {
		case value in DISPLAY_NAMES: {
			return DISPLAY_NAMES[value]
		}
		default:
			return value?.charAt(0).toUpperCase() + value?.slice(1)
	}
}

export const Option = ({
	onSelect,
	selected,
	optionValue,
}: {
	onSelect: () => void
	selected: boolean
	optionValue: string
}) => {
	if (!optionValue || !optionValue.length) {
		return <></>
	}
	return (
		<div
			className={classNames(devStyles.option, {
				[devStyles.selected]: selected,
			})}
			onClick={onSelect}
		>
			{getNetworkResourcesDisplayName(optionValue)}
		</div>
	)
}
