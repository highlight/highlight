import '/__generated/antd.css'
import '@highlight-run/rrweb/dist/rrweb.min.css'
import '@fontsource/poppins'
import './index.css'
import './style/tailwind.css'
import '/__generated/index.css'

import * as React from 'react'

export const init = () => {
	document.body.className = 'highlight-light-theme'
}

export const Root = ({ children }: { children: React.ReactNode }) => {
	return children
}
