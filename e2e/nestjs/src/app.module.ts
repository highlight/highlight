import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
