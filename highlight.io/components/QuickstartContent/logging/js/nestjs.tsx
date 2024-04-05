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
					text: `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HighlightInterceptor, H } from '@highlight-run/nest';

const env = {
  projectID: '<YOUR_PROJECT_ID>',
  serviceName: 'my-nestjs-app',
  serviceVersion: 'git-sha',
  environment: 'production',
  debug: false,
};

async function bootstrap() {
  H.init(env);
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new HighlightInterceptor(env));
  await app.listen(3000);
}
bootstrap();
`,
					language: 'js',
				},
			],
		},
		verifyLogs,
	],
}
