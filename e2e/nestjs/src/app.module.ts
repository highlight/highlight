import { Module, OnModuleDestroy } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { HttpAdapterHost } from '@nestjs/core'

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
