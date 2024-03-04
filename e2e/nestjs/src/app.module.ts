import { Module, OnModuleDestroy } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule implements OnModuleDestroy {
	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	async onModuleDestroy() {
		this.httpAdapterHost.httpAdapter.close()
	}
}
