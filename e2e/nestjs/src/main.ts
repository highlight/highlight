import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { HighlightLogger, HighlightInterceptor } from '@highlight-run/nest'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	const highlightOpts = {
		projectID: '1',
		otlpEndpoint: 'http://localhost:4318',
	}
	app.useLogger(new HighlightLogger(highlightOpts))
	app.useGlobalInterceptors(new HighlightInterceptor(highlightOpts))
	await app.listen(3002)
}
bootstrap()
