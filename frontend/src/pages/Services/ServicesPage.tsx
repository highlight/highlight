import LeadAlignLayout from '@components/layout/LeadAlignLayout'
import React from 'react'

import { ServicesTable } from './ServicesTable'

export const ServicesPage = () => {
	return (
		<LeadAlignLayout maxWidth={1200}>
			<ServicesTable />
		</LeadAlignLayout>
	)
}
