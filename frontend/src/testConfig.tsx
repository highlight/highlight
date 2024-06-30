import './index.css'
import './style/tailwind.css'
import '/__generated/antd.css'
import '/__generated/index.css'
import '@fontsource/poppins'
import '@highlight-run/ui/styles.css'
import 'rrweb/dist/style.css'

import * as React from 'react'

export const init = () => {
	document.body.className = 'highlight-light-theme'
}

export const Root = ({ children }: { children: React.ReactNode }) => {
	return children
}
