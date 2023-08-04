import React from 'react'
import { ReportDialog as ReactReportDialog } from '@highlight-run/react'

export function ReportDialog() {
	return typeof window === 'object' ? <ReactReportDialog /> : null
}
