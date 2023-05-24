import useLocalStorage from '@rehooks/local-storage'
import React, { useEffect } from 'react'
import { RiMoonClearFill, RiSunLine } from 'react-icons/ri'

import { useAuthContext } from '../../../routers/AuthenticationRolerouter/context/AuthContext'
import Button from '../../Button/Button/Button'

enum THEMES {
	Dark = 'dark',
	Light = 'light',
}

const ThemeToggle = () => {
	const [theme, setTheme] = useLocalStorage(
		'highlight-theme',
		window.matchMedia &&
			window.matchMedia('(prefers-color-scheme: dark)').matches
			? THEMES.Dark
			: THEMES.Light,
	)
	const { isHighlightAdmin } = useAuthContext()

	useEffect(() => {
		if (isHighlightAdmin) {
			const newTheme = theme === THEMES.Dark ? THEMES.Light : THEMES.Dark
			document.documentElement.setAttribute('data-theme', newTheme)
		}
	}, [isHighlightAdmin, theme])

	if (!isHighlightAdmin) {
		return null
	}

	return (
		<Button
			type="text"
			trackingId="ToggleTheme"
			iconButton
			onClick={() => {
				const newTheme =
					theme === THEMES.Dark ? THEMES.Light : THEMES.Dark
				setTheme(newTheme)
			}}
			style={{
				color: 'var(--text-primary)',
			}}
		>
			{theme === THEMES.Dark ? <RiMoonClearFill /> : <RiSunLine />}
		</Button>
	)
}

export default ThemeToggle
