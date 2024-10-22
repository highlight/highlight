import { ReportDialog as ReactReportDialog } from '@highlight-run/react'
import React from 'react'

export function ReportDialog() {
	return typeof window === 'object' ? <ReactReportDialog /> : null
}
