import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { verifyLogs } from '../shared-snippets'

export const HostingVercelLogContent: QuickStartContent = {
	title: 'Vercel',
	subtitle: 'Learn how to setup highlight log ingestion on Vercel.',
	logoUrl: siteUrl('/images/quickstart/vercel.svg'),
	entries: [
		{
			title: 'Setup the Highlight Vercel integration.',
			content:
				'Visit the [Vercel Highlight Integration page](https://vercel.com/integrations/highlight) to install it in your account.' +
				'A log drain will automatically be created for all projects you grant access to.',
		},
		verifyLogs,
	],
}
