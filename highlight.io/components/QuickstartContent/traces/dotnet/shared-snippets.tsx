import { siteUrl } from '../../../../utils/urls'
import { fullstackMappingLink } from '../../frontend/shared-snippets'
import { QuickStartStep } from '../../QuickstartContent'

export const setupFrontendSnippet: string = `<script src="https://unpkg.com/highlight.run"></script>
    <script>
        H.init('<YOUR_PROJECT_ID>', {
            serviceName: 'highlight-dot-net-frontend',
            tracingOrigins: true,
            enableOtelTracing: true,
            networkRecording: {
                enabled: true,
                recordHeadersAndBody: true,
            },
        });
    </script>`

export const downloadSnippet = (): QuickStartStep => {
	return {
		title: 'Install the highlight-io .NET SDK.',
		content:
			'Download the package from NuGet and save it to your project solution. ',
		code: [
			{
				key: 'dotnet',
				text: `dotnet add Highlight.ASPCore`,
				language: 'bash',
			},
		],
	}
}
