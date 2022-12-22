import { useEffect } from 'react'

type Theme = 'light' | 'dark'

export const useTheme = (theme: Theme) => {
	useEffect(() => {
		document.body.classList.add(`highlight-${theme}-theme`)
	}, [theme])
}
