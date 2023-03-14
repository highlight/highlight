import { HttpAdapterHost, NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { HighlightLogger, HighlightErrorFilter } from '@highlight-run/nest'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const highlightOpts = {
		projectID: '1',
		otlpEndpoint: 'http://localhost:4318',
	}
	app.useLogger(new HighlightLogger(highlightOpts))
	app.useGlobalFilters(
		new HighlightErrorFilter(app.get(HttpAdapterHost), highlightOpts),
	)
	await app.listen(3002)
}
bootstrap()
