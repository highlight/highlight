import { siteUrl } from '../../../../utils/urls'
import { QuickStartContent } from '../../QuickstartContent'
import { previousInstallSnippet, verifyLogs } from '../shared-snippets'

export const JSNestLogContent: QuickStartContent = {
	title: 'Logging from Nest.js',
	subtitle: 'Learn how to set up highlight.io log ingestion in Nest.js.',
	logoUrl: siteUrl('/images/quickstart/nestjs.svg'),
	entries: [
		previousInstallSnippet('nestjs'),
		{
			title: 'Add the @highlight-run/nest app middleware.',
			content:
				'Use the `HighlightLogger` middleware to record backend logs in highlight.io',
			code: [
				{
					text: `import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { HighlightLogger } from '@highlight-run/nest'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.useLogger(
    new HighlightLogger({
      projectID: '<YOUR_PROJECT_ID>',
      serviceName: 'my-nestjs-app',
      serviceVersion: 'git-sha',
      environment: 'production'
    })
  )
  await app.listen(3000)
}
bootstrap()
`,
					language: 'js',
				},
			],
		},
		verifyLogs,
	],
}
