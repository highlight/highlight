import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello(): Promise<string[]> {
    return await this.appService.findAll({});
  }

  @Get('/empty')
  async getEmpty() {
    return await this.appService.findAll({ empty: true });
  }

  @Get('/error')
  async getError(): Promise<string[]> {
    return await this.appService.findAll({ error: true });
  }
}
