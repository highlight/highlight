import { siteUrl } from '../../../../utils/urls'
import { fullstackMappingLink } from '../../frontend/shared-snippets'
import { QuickStartStep } from '../../QuickstartContent'

export const setupFrontendSnippet: string = `<script src="https://unpkg.com/highlight.run"></script>
    <script>
        H.init('<YOUR_PROJECT_ID>', {
            serviceName: 'highlight-dot-net-frontend',
            tracingOrigins: true,
            networkRecording: {
                enabled: true,
                recordHeadersAndBody: true,
            },
        });
    </script>`

export const downloadSnippet = (
	flavor?: 'ASPCore' | 'ASP4',
): QuickStartStep => {
	const pm = `${flavor === 'ASP4' ? 'nuget install' : 'dotnet add'}`
	return {
		title: 'Install the highlight-io .NET SDK.',
		content:
			'Download [the highlight SDK package from NuGet](https://www.nuget.org/profiles/Highlight) and save it to your project solution. ',
		code: [
			{
				key: 'dotnet',
				text: `${pm} Highlight.${flavor ?? 'ASPCore'}`,
				language: 'bash',
			},
		],
	}
}
